import { randomUUID } from 'crypto'
import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import type { AdFormat, AdStyle } from '@/app/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FREE_AD_LIMIT = 1
const BUCKET = 'product-images'

// dall-e-3 has been retired from the API ("The model 'dall-e-3' does not
// exist") — gpt-image-1 is the current replacement. It only supports
// 1024x1024 / 1536x1024 / 1024x1536 (not dall-e-3's 1792x1024/1024x1792),
// doesn't accept response_format (always returns b64_json), and doesn't
// accept the vivid/natural `style` param dall-e-3 had. Confirmed against
// the live API on 2026-07-23, not just the (stale) bundled SDK types.
const IMAGE_MODEL = 'gpt-image-1'
const IMAGE_QUALITY = 'medium'

const SIZE_BY_FORMAT: Record<AdFormat, '1024x1024' | '1536x1024' | '1024x1536'> = {
  square: '1024x1024',
  horizontal: '1536x1024',
  vertical: '1024x1536',
}

const STYLE_PROMPTS: Record<AdStyle, string> = {
  clean: 'Clean, professional product photography on a simple neutral studio background, soft even lighting, sharp focus. No text, no graphics — just the product.',
  lifestyle: 'A lifestyle scene showing the product in real, everyday use, natural lighting, authentic and relatable. No text overlays.',
  bold: 'A bold, high-contrast graphic ad composition with the product as the hero and a short, punchy marketing headline rendered in large bold typography. Vibrant colors, scroll-stopping social media ad style.',
  minimalist: 'A minimalist composition with generous negative space, a muted premium color palette, elegant styling. No text.',
}

function buildAdPrompt(title: string, description: string, adAngle: string, style: AdStyle) {
  return `Create a high-quality e-commerce advertisement image for this product: "${title}". ${description}

Ad angle / marketing message to visually convey: ${adAngle}

Visual style: ${STYLE_PROMPTS[style]}

The image should look like a professional, polished advertisement ready to run on social media. Do not include any watermarks.`
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[generate-ad] Rejected: no authenticated user on the request')
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, ads_generated')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(
      `[generate-ad] Failed to load profile for user ${user.id}:`,
      profileError ? { code: profileError.code, message: profileError.message, details: profileError.details, hint: profileError.hint } : 'no profile row returned'
    )
    return Response.json({ error: 'profile_not_found' }, { status: 404 })
  }

  if (profile.plan === 'free' && profile.ads_generated >= FREE_AD_LIMIT) {
    console.error(`[generate-ad] User ${user.id} hit the free ad limit (${profile.ads_generated}/${FREE_AD_LIMIT})`)
    return Response.json({ error: 'limit_reached', ads_generated: profile.ads_generated }, { status: 403 })
  }

  let product_id: string, title: string, description: string, ad_angle: string
  let format: AdFormat, style: AdStyle
  try {
    const body = await request.json()
    product_id = body.product_id
    title = body.title
    description = body.description
    ad_angle = body.ad_angle
    format = body.format
    style = body.style
    if (!title || !ad_angle || !SIZE_BY_FORMAT[format] || !STYLE_PROMPTS[style]) {
      throw new Error(`missing or invalid fields in request body: ${JSON.stringify(body)}`)
    }
  } catch (err) {
    console.error('[generate-ad] Failed to parse/validate request body:', err)
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch (err) {
    console.error('[generate-ad] getServiceRoleClient() failed — SUPABASE_SERVICE_ROLE_KEY missing or invalid:', err)
    return Response.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[generate-ad] OPENAI_API_KEY is not set on the server')
    return Response.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  let imageBuffer: Buffer
  try {
    const prompt = buildAdPrompt(title, description ?? '', ad_angle, style)
    console.error(`[generate-ad] Calling OpenAI images.generate — model=${IMAGE_MODEL} size=${SIZE_BY_FORMAT[format]} quality=${IMAGE_QUALITY} user=${user.id} product=${product_id}`)

    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: SIZE_BY_FORMAT[format],
      quality: IMAGE_QUALITY,
      n: 1,
    })

    const b64 = result.data?.[0]?.b64_json
    if (!b64) {
      console.error('[generate-ad] OpenAI response had no b64_json. Full response:', JSON.stringify(result))
      throw new Error('No image data returned from OpenAI')
    }
    imageBuffer = Buffer.from(b64, 'base64')
    console.error(`[generate-ad] Image generated successfully, ${imageBuffer.length} bytes`)
  } catch (err) {
    // OpenAI SDK errors carry status/code/type that .message alone won't show.
    if (err instanceof OpenAI.APIError) {
      console.error('[generate-ad] OpenAI API error:', {
        status: err.status,
        code: err.code,
        type: err.type,
        message: err.message,
      })
    } else {
      console.error('[generate-ad] Unexpected error calling OpenAI images.generate:', err)
    }
    return Response.json({ error: 'ad_generation_failed' }, { status: 502 })
  }

  // Try to persist to Supabase storage for a permanent URL. If this fails
  // (bucket missing, storage misconfigured, etc.) fall back to a data: URI
  // built from the bytes we already have, so the user still sees and can
  // download their result immediately — it just won't show up later in the
  // gallery until storage is fixed.
  let imageUrl: string
  let persistedToStorage = false
  try {
    const path = `ads/${user.id}/${randomUUID()}.png`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, imageBuffer, { contentType: 'image/png', upsert: false })

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
    imageUrl = publicUrlData.publicUrl
    persistedToStorage = true
    console.error(`[generate-ad] Uploaded to storage at ${path}`)
  } catch (err) {
    console.error(
      `[generate-ad] Storage upload failed, falling back to a data: URI so the user still sees their image. Bucket="${BUCKET}". Error:`,
      err
    )
    imageUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`
  }

  // Best-effort bookkeeping — neither of these should block the response,
  // since the user already has a real image at this point.
  let adId: string | null = null
  try {
    const { data: adRecord, error: insertError } = await supabaseAdmin
      .from('generated_ads')
      .insert({
        user_id: user.id,
        product_id: product_id ?? null,
        ad_angle,
        format,
        style,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (insertError) throw insertError
    adId = adRecord?.id ?? null
  } catch (err) {
    console.error('[generate-ad] Failed to save generated_ads record (image still returned to client):', err)
  }

  try {
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ ads_generated: profile.ads_generated + 1 })
      .eq('id', user.id)

    if (updateError) throw updateError
  } catch (err) {
    console.error('[generate-ad] Failed to increment ads_generated (image still returned to client):', err)
  }

  return Response.json({
    id: adId,
    image_url: imageUrl,
    ad_angle,
    format,
    style,
    persisted: persistedToStorage,
  })
}

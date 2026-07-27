import { randomUUID } from 'crypto'
import OpenAI, { toFile } from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { parseSafeStoreUrl } from '@/app/lib/urlSafety'
import { trackEvent } from '@/app/lib/analytics'
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

const FORMAT_LABEL: Record<AdFormat, string> = {
  square: 'Square',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
}

const STYLE_LABEL: Record<AdStyle, string> = {
  clean: 'Clean Product Shot',
  lifestyle: 'Lifestyle Scene',
  bold: 'Bold Text Focus',
  minimalist: 'Minimalist',
}

// Platform-specific visual conventions to steer composition, not just aspect ratio.
const FORMAT_PLATFORM_PROMPTS: Record<AdFormat, string> = {
  square: 'Square 1:1 format, styled like a native Instagram/Facebook feed ad — centered composition, thumb-stopping visual, reads clearly at small mobile-feed thumbnail size.',
  vertical: 'Vertical 9:16 format, styled like a native TikTok/Instagram Reels ad — full-bleed composition designed for a full-screen mobile app feed, bold and immediate, key subject centered in the safe zone.',
  horizontal: 'Horizontal 16:9 format, styled like a YouTube thumbnail — high contrast, single clear focal point that reads well even at a small preview size.',
}

const STYLE_PROMPTS: Record<AdStyle, string> = {
  clean: 'Clean product shot: pure white seamless background, professional studio lighting, soft realistic shadow beneath the product, sharp focus. No text, no graphics — presented like a premium catalog photo.',
  lifestyle: 'Lifestyle scene: the product shown in a natural, real-world environment being used by a real person in an authentic, candid moment. Natural lighting, relatable setting. No text overlays.',
  bold: 'Bold text focus: the product as the hero of a high-contrast graphic composition with a short, punchy marketing headline rendered in large, bold typography. Vibrant colors, scroll-stopping social ad style.',
  minimalist: 'Minimalist: generous negative space/whitespace surrounding a single product, muted premium color palette, elegant and restrained styling. No text.',
}

function buildCorePrompt(title: string, description: string, adAngle: string, style: AdStyle, format: AdFormat) {
  return `Product: "${title}"${description ? ` — ${description}` : ''}

Ad angle / marketing message to visually convey: ${adAngle}

Format: ${FORMAT_LABEL[format]}. ${FORMAT_PLATFORM_PROMPTS[format]}

Style: ${STYLE_LABEL[style]}. ${STYLE_PROMPTS[style]}

Make it look like a premium, polished Facebook/Instagram ad, ready to run — professional composition, realistic lighting, no watermarks, no placeholder text.`
}

function buildReferenceAdPrompt(title: string, description: string, adAngle: string, style: AdStyle, format: AdFormat) {
  return `Create a professional ecommerce advertisement for this exact product. The attached image is the real product — match its shape, color, materials, proportions, and design precisely. Do not invent a different product or substitute a generic item.

${buildCorePrompt(title, description, adAngle, style, format)}`
}

function buildTextOnlyAdPrompt(title: string, description: string, adAngle: string, style: AdStyle, format: AdFormat) {
  return `Create a professional ecommerce advertisement for this exact product. Match the product appearance precisely to its title and description below — do not depict an unrelated or generic item.

${buildCorePrompt(title, description, adAngle, style, format)}`
}

const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB, matches the UI's upload limit

// Loads a reference image either from a data: URI (uploaded directly) or an
// http(s) URL (from Supabase storage after upload, or pasted by the user).
// User-pasted URLs are fetched server-side, so they go through the same
// SSRF hardening as the Store Intelligence scraper before being requested.
async function loadReferenceImage(referenceImageUrl: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    if (referenceImageUrl.startsWith('data:')) {
      const match = /^data:(.+);base64,(.+)$/.exec(referenceImageUrl)
      if (!match) return null
      const buffer = Buffer.from(match[2], 'base64')
      if (buffer.length === 0 || buffer.length > MAX_REFERENCE_IMAGE_BYTES) return null
      return { buffer, contentType: match[1] }
    }

    const safeUrl = parseSafeStoreUrl(referenceImageUrl)
    if (!safeUrl) return null

    const res = await fetch(safeUrl.toString(), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/png'
    if (!contentType.startsWith('image/')) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length === 0 || buffer.length > MAX_REFERENCE_IMAGE_BYTES) return null
    return { buffer, contentType }
  } catch {
    return null
  }
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
  let format: AdFormat, style: AdStyle, referenceImageUrl: string | undefined
  try {
    const body = await request.json()
    product_id = body.product_id
    title = body.title
    description = body.description
    ad_angle = body.ad_angle
    format = body.format
    style = body.style
    referenceImageUrl = typeof body.referenceImageUrl === 'string' && body.referenceImageUrl.trim() ? body.referenceImageUrl.trim() : undefined
    if (!title || !ad_angle || !SIZE_BY_FORMAT[format] || !STYLE_PROMPTS[style]) {
      throw new Error(`missing or invalid fields in request body: ${JSON.stringify(body)}`)
    }
  } catch (err) {
    console.error('[generate-ad] Failed to parse/validate request body:', err)
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  let referenceImage: { buffer: Buffer; contentType: string } | null = null
  if (referenceImageUrl) {
    referenceImage = await loadReferenceImage(referenceImageUrl)
    if (!referenceImage) {
      console.error(`[generate-ad] Failed to load reference image for user ${user.id}: ${referenceImageUrl.slice(0, 100)}`)
      return Response.json({ error: 'invalid_reference_image' }, { status: 400 })
    }
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
    let result
    if (referenceImage) {
      const prompt = buildReferenceAdPrompt(title, description ?? '', ad_angle, style, format)
      const referenceFile = await toFile(referenceImage.buffer, 'reference.png', { type: referenceImage.contentType })
      console.error(`[generate-ad] Calling OpenAI images.edit (with reference image) — model=${IMAGE_MODEL} size=${SIZE_BY_FORMAT[format]} quality=${IMAGE_QUALITY} user=${user.id} product=${product_id}`)

      result = await openai.images.edit({
        model: IMAGE_MODEL,
        image: referenceFile,
        prompt,
        size: SIZE_BY_FORMAT[format],
        quality: IMAGE_QUALITY,
        input_fidelity: 'high',
        n: 1,
      })
    } else {
      const prompt = buildTextOnlyAdPrompt(title, description ?? '', ad_angle, style, format)
      console.error(`[generate-ad] Calling OpenAI images.generate — model=${IMAGE_MODEL} size=${SIZE_BY_FORMAT[format]} quality=${IMAGE_QUALITY} user=${user.id} product=${product_id}`)

      result = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt,
        size: SIZE_BY_FORMAT[format],
        quality: IMAGE_QUALITY,
        n: 1,
      })
    }

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
      console.error('[generate-ad] Unexpected error calling OpenAI images.generate/edit:', err)
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

  await trackEvent('ad_generated', { userId: user.id, metadata: { format, style } })

  return Response.json({
    id: adId,
    image_url: imageUrl,
    ad_angle,
    format,
    style,
    persisted: persistedToStorage,
  })
}

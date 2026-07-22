import { randomUUID } from 'crypto'
import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import type { AdFormat, AdStyle } from '@/app/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FREE_AD_LIMIT = 1
const BUCKET = 'product-images'

const SIZE_BY_FORMAT: Record<AdFormat, '1024x1024' | '1792x1024' | '1024x1792'> = {
  square: '1024x1024',
  horizontal: '1792x1024',
  vertical: '1024x1792',
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
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, ads_generated')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return Response.json({ error: 'profile_not_found' }, { status: 404 })
  }

  if (profile.plan === 'free' && profile.ads_generated >= FREE_AD_LIMIT) {
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
      throw new Error('missing or invalid fields')
    }
  } catch {
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return Response.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  let imageBuffer: Buffer
  try {
    const prompt = buildAdPrompt(title, description ?? '', ad_angle, style)
    const result = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: SIZE_BY_FORMAT[format],
      quality: 'standard',
      style: 'vivid',
      n: 1,
      response_format: 'b64_json',
    })
    const b64 = result.data?.[0]?.b64_json
    if (!b64) throw new Error('No image data returned from DALL-E')
    imageBuffer = Buffer.from(b64, 'base64')
  } catch (err) {
    console.error('DALL-E ad generation failed:', err)
    return Response.json({ error: 'ad_generation_failed' }, { status: 502 })
  }

  const path = `ads/${user.id}/${randomUUID()}.png`
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, imageBuffer, { contentType: 'image/png', upsert: false })

  if (uploadError) {
    console.error('Failed to upload generated ad:', uploadError.message)
    return Response.json({ error: 'upload_failed' }, { status: 500 })
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  const imageUrl = publicUrlData.publicUrl

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

  if (insertError) {
    console.error('Failed to save generated ad record:', insertError.message)
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ ads_generated: profile.ads_generated + 1 })
    .eq('id', user.id)

  if (updateError) {
    console.error('Failed to increment ads_generated:', updateError.message)
  }

  return Response.json({
    id: adRecord?.id ?? null,
    image_url: imageUrl,
    ad_angle,
    format,
    style,
  })
}

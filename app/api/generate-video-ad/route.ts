import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { trackEvent } from '@/app/lib/analytics'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FORMAT_LABEL: Record<string, string> = {
  vertical: 'Vertical 9:16 (TikTok/Reels)',
  square: 'Square 1:1 (Instagram)',
  horizontal: 'Horizontal 16:9 (YouTube)',
}

const STYLE_LABEL: Record<string, string> = {
  ugc: 'UGC Style',
  showcase: 'Product Showcase',
  testimonial: 'Testimonial Style',
  text_forward: 'Text-Forward',
}

const DURATIONS = ['15', '30', '60']

type Scene = { scene_number: number; description: string; text_overlay: string }

/**
 * POST /api/generate-video-ad
 * Auth required. Body: { productTitle, productDescription, adAngle, format,
 * style, duration, referenceImageUrl? }. Real video generation isn't wired
 * up yet — this generates a detailed, scene-by-scene video ad script and
 * storyboard via OpenAI, so users get something usable (in CapCut, InShot,
 * etc.) today, ahead of a future real video-generation integration against
 * the same video_ad_scripts table.
 */
export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let productTitle: string, productDescription: string, adAngle: string
  let format: string, style: string, duration: string, productId: string | undefined
  try {
    const body = await request.json()
    productTitle = body.productTitle
    productDescription = body.productDescription ?? ''
    adAngle = body.adAngle
    format = body.format
    style = body.style
    duration = DURATIONS.includes(String(body.duration)) ? String(body.duration) : '30'
    productId = typeof body.productId === 'string' ? body.productId : undefined
    if (!productTitle || !adAngle || !FORMAT_LABEL[format] || !STYLE_LABEL[style]) {
      throw new Error(`missing or invalid fields in request body: ${JSON.stringify(body)}`)
    }
  } catch (err) {
    console.error('[generate-video-ad] Failed to parse/validate request body:', err)
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const prompt = `You are an expert short-form video ad scriptwriter for ecommerce/dropshipping brands. Write a complete, ready-to-shoot video ad script and storyboard. Return ONLY a JSON object with no markdown.

Product: "${productTitle}"${productDescription ? ` — ${productDescription}` : ''}
Ad angle / core marketing message: ${adAngle}
Format: ${FORMAT_LABEL[format]}
Style: ${STYLE_LABEL[style]}
Target duration: ${duration} seconds

Break the script into scenes that fit naturally within ${duration} seconds total (roughly one scene per 3-6 seconds). For each scene, describe exactly what's shown on screen (camera angle, action, product placement) and suggest a short on-screen text overlay for that scene. Write a full voiceover/narration script that a creator could read while filming. Suggest a background music mood that fits the style and platform.

Return exactly this JSON structure:
{
  "script": "<a short overview paragraph summarizing the whole ad concept>",
  "scenes": [
    { "scene_number": 1, "description": "<what's shown on screen>", "text_overlay": "<short on-screen text for this scene>" }
  ],
  "voiceover": "<the full voiceover/narration script, written to be read aloud>",
  "music_suggestion": "<a short description of the background music mood/genre>",
  "estimated_duration": "<e.g. '${duration} seconds'>"
}`

  let result: { script: string; scenes: Scene[]; voiceover: string; music_suggestion: string; estimated_duration: string }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    result = JSON.parse(completion.choices[0].message.content!)
  } catch (err) {
    console.error('[generate-video-ad] OpenAI script generation failed:', err)
    return Response.json({ error: 'script_generation_failed' }, { status: 502 })
  }

  // Best-effort save — the user already has their script at this point, so
  // a persistence failure shouldn't block the response.
  try {
    const supabaseAdmin = getServiceRoleClient()
    await supabaseAdmin.from('video_ad_scripts').insert({
      user_id: user.id,
      product_id: productId ?? null,
      product_title: productTitle,
      ad_angle: adAngle,
      format,
      style,
      duration,
      script: result.script,
      scenes: result.scenes,
      voiceover: result.voiceover,
      music_suggestion: result.music_suggestion,
    })
  } catch (err) {
    console.error('[generate-video-ad] Failed to save video_ad_scripts record (script still returned to client):', err)
  }

  await trackEvent('video_script_generated', { userId: user.id, metadata: { format, style, duration } })

  return Response.json(result)
}

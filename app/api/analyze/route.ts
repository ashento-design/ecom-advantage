import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FREE_ANALYSIS_LIMIT = 3

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, analyses_used')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return Response.json({ error: 'profile_not_found' }, { status: 404 })
  }

  if (profile.plan === 'free' && profile.analyses_used >= FREE_ANALYSIS_LIMIT) {
    return Response.json({ error: 'limit_reached', analyses_used: FREE_ANALYSIS_LIMIT }, { status: 403 })
  }

  let product_id: string | undefined
  let title: string, description: string, niche: string
  try {
    const body = await request.json()
    product_id = body.product_id
    title = body.title
    description = body.description
    niche = body.niche
  } catch {
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const prompt = `You are an expert e-commerce analyst specializing in dropshipping. Analyze this product and return ONLY a JSON object with no markdown.

Product Title: ${title}
Description: ${description}
Niche: ${niche}

Return exactly this JSON structure:
{
  "demand_score": <integer 1-100>,
  "competition_level": "<Low|Medium|High>",
  "suggested_price": "<range like $19.99-$34.99>",
  "ad_angles": ["<angle 1>", "<angle 2>", "<angle 3>"],
  "hooks": ["<hook 1>", "<hook 2>", "<hook 3>"],
  "summary": "<2-3 sentences on market opportunity and why this product works>",
  "target_audience": "<who this product is for, e.g. 'Pet owners aged 25-45'>",
  "best_platforms": ["<platform 1>", "<platform 2>", "<platform 3>"],
  "seasonality": "<e.g. 'Year-round' or 'Peak: Q4'>",
  "wow_factor": "<one sentence on what makes this product viral-worthy>"
}`

  let result
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    result = JSON.parse(completion.choices[0].message.content!)
  } catch (err) {
    console.error('OpenAI analysis failed:', err)
    return Response.json({ error: 'analysis_failed' }, { status: 502 })
  }

  await supabase
    .from('profiles')
    .update({ analyses_used: profile.analyses_used + 1 })
    .eq('id', user.id)

  if (product_id) {
    const { error: insertError } = await supabase.from('ai_analyses').insert({
      user_id: user.id,
      product_id,
      demand_score: result.demand_score,
      competition_level: result.competition_level,
      suggested_price: result.suggested_price,
      ad_angles: result.ad_angles,
      hooks: result.hooks,
      summary: result.summary,
      target_audience: result.target_audience,
      best_platforms: result.best_platforms,
      seasonality: result.seasonality,
      wow_factor: result.wow_factor,
    })
    if (insertError) {
      console.error('Failed to persist analysis:', insertError.message)
    }
  }

  return Response.json(result)
}

import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { parseSafeStoreUrl } from '@/app/lib/urlSafety'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type ScrapedProduct = {
  title: string
  price: string
  image_url: string
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchoryBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchText(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchoryBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('store_analyses')
    .select('id, store_url, store_name, analysis_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return Response.json({ error: 'profile_not_found' }, { status: 404 })
  }

  if (profile.plan !== 'pro') {
    return Response.json({ error: 'pro_required' }, { status: 403 })
  }

  let storeUrlInput: string
  try {
    const body = await request.json()
    storeUrlInput = body.storeUrl
    if (!storeUrlInput || typeof storeUrlInput !== 'string') {
      throw new Error('missing storeUrl')
    }
  } catch {
    return Response.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const storeUrl = parseSafeStoreUrl(storeUrlInput)
  if (!storeUrl) {
    return Response.json({ error: 'invalid_url' }, { status: 400 })
  }

  const origin = `${storeUrl.protocol}//${storeUrl.host}`

  const [productsData, collectionsData, aboutHtml] = await Promise.all([
    fetchJson(`${origin}/products.json?limit=20&sort_by=best-selling`),
    fetchJson(`${origin}/collections.json`),
    fetchText(`${origin}/pages/about`),
  ])

  const rawProducts: Array<Record<string, unknown>> = Array.isArray(productsData?.products)
    ? productsData.products
    : []

  if (rawProducts.length === 0 && !collectionsData) {
    return Response.json({ error: 'store_unreachable' }, { status: 502 })
  }

  const topProducts: ScrapedProduct[] = rawProducts.slice(0, 8).map((p) => {
    const variants = Array.isArray(p.variants) ? p.variants as Array<Record<string, unknown>> : []
    const images = Array.isArray(p.images) ? p.images as Array<Record<string, unknown>> : []
    return {
      title: String(p.title ?? 'Untitled product'),
      price: variants[0]?.price ? `$${variants[0].price}` : 'Unknown',
      image_url: String(images[0]?.src ?? ''),
    }
  }).filter((p) => p.image_url)

  const collectionTitles: string[] = Array.isArray(collectionsData?.collections)
    ? (collectionsData.collections as Array<Record<string, unknown>>).map((c) => String(c.title ?? '')).filter(Boolean)
    : []

  const aboutText = aboutHtml ? stripHtml(aboutHtml).slice(0, 1500) : null
  const oldestProductDate = rawProducts
    .map((p) => p.created_at as string | undefined)
    .filter(Boolean)
    .sort()[0]

  const prompt = `You are an expert Shopify store analyst helping a dropshipper size up a competitor. Based on the following REAL scraped data from a live Shopify store, estimate the store's performance and provide actionable insights. Be realistic — most small-to-mid Shopify stores do NOT make millions. Return ONLY a JSON object with no markdown.

Store URL: ${storeUrl.hostname}
Number of products found: ${rawProducts.length}
Top product titles and prices: ${JSON.stringify(topProducts.map((p) => ({ title: p.title, price: p.price })))}
Collections / categories: ${JSON.stringify(collectionTitles.slice(0, 15))}
Oldest product listed date (proxy for store age): ${oldestProductDate ?? 'unknown'}
About page excerpt: ${aboutText ?? 'not available'}

Return exactly this JSON structure:
{
  "store_name": "<best guess at the brand/store name>",
  "estimated_monthly_revenue": "<realistic range like '$8,000 - $25,000'>",
  "estimated_monthly_visitors": "<realistic range like '15,000 - 40,000'>",
  "confidence_level": "<Low|Medium|High>",
  "main_niches": ["<niche 1>", "<niche 2>"],
  "ad_activity": "<Active|Low|Unknown>",
  "store_age_estimate": "<e.g. '1-2 years' or 'Unknown'>",
  "revenue_trend": "<Growing|Stable|Declining|Unknown>",
  "insights": ["<3-5 actionable insights a dropshipper could act on>"],
  "winning_angles": ["<2-3 ad angles based on their apparent best sellers>"]
}`

  let aiResult: Record<string, unknown>
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    aiResult = JSON.parse(completion.choices[0].message.content!)
  } catch (err) {
    console.error('[store-intelligence] OpenAI analysis failed:', err)
    return Response.json({ error: 'analysis_failed' }, { status: 502 })
  }

  const analysis = {
    ...aiResult,
    top_products: topProducts,
  }

  try {
    const { error: insertError } = await supabase.from('store_analyses').insert({
      user_id: user.id,
      store_url: storeUrl.hostname,
      store_name: typeof aiResult.store_name === 'string' ? aiResult.store_name : storeUrl.hostname,
      analysis_data: analysis,
    })
    if (insertError) throw insertError
  } catch (err) {
    console.error('[store-intelligence] Failed to save analysis (still returning result):', err)
  }

  return Response.json(analysis)
}

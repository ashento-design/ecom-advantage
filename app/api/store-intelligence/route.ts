import OpenAI from 'openai'
import { createServerClient } from '@/app/lib/supabase'
import { parseSafeStoreUrl } from '@/app/lib/urlSafety'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type ScrapedProduct = {
  title: string
  price: string
  image_url: string
}

const SIZE_TIERS = {
  Micro: 'under $10,000/month',
  Small: '$10,000 - $100,000/month',
  Medium: '$100,000 - $1,000,000/month',
  Large: '$1,000,000 - $10,000,000/month',
  Enterprise: '$10,000,000+/month',
} as const

type SizeTier = keyof typeof SIZE_TIERS

async function tryFetch(url: string): Promise<Response | null> {
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchoryBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
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

// Best-effort external traffic signals to help calibrate revenue estimates.
// Both sources are unreliable in practice — SimilarWeb's endpoint is an
// undocumented internal API that frequently blocks non-browser traffic, and
// SEMrush requires a paid API key — so failures here are silent and the
// analysis proceeds without them rather than blocking the request.
async function fetchTrafficSignals(hostname: string): Promise<string | null> {
  const signals: string[] = []

  try {
    const res = await fetch(`https://data.similarweb.com/api/v1/data?domain=${encodeURIComponent(hostname)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchoryBot/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      const visitsByMonth = data?.EstimatedMonthlyVisits
      const latestMonth = visitsByMonth && typeof visitsByMonth === 'object'
        ? Object.keys(visitsByMonth).sort().pop()
        : undefined
      const latestVisits = latestMonth ? Number(visitsByMonth[latestMonth]) : NaN
      const globalRank = Number(data?.GlobalRank?.Rank ?? data?.GlobalRank)
      if (Number.isFinite(latestVisits) && latestVisits > 0) {
        signals.push(`SimilarWeb estimated monthly visits: ~${Math.round(latestVisits).toLocaleString()}`)
      }
      if (Number.isFinite(globalRank) && globalRank > 0) {
        signals.push(`SimilarWeb global traffic rank: #${globalRank.toLocaleString()}`)
      }
    }
  } catch {
    // best-effort only
  }

  const semrushKey = process.env.SEMRUSH_API_KEY
  if (semrushKey) {
    try {
      const res = await fetch(
        `https://api.semrush.com/analytics/v1/?action=domain_ranks&key=${semrushKey}&domain=${encodeURIComponent(hostname)}&export_columns=Or,Ot,Oc&database=us`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (res.ok) {
        const text = (await res.text()).trim()
        if (text && !/^error/i.test(text) && !text.toLowerCase().includes('validation error')) {
          signals.push(`SEMrush organic data (keywords, traffic, cost): ${text.slice(0, 300)}`)
        }
      }
    } catch {
      // best-effort only
    }
  }

  return signals.length > 0 ? signals.join('\n') : null
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

  const [productsRes, collectionsRes, aboutHtml] = await Promise.all([
    tryFetch(`${origin}/products.json?limit=20&sort_by=best-selling`),
    tryFetch(`${origin}/collections.json`),
    fetchText(`${origin}/pages/about`),
  ])

  if (!productsRes && !collectionsRes) {
    return Response.json({ error: 'store_unreachable' }, { status: 502 })
  }

  const productsData = productsRes?.ok ? await productsRes.json().catch(() => null) : null
  const collectionsData = collectionsRes?.ok ? await collectionsRes.json().catch(() => null) : null

  const rawProducts: Array<Record<string, unknown>> = Array.isArray(productsData?.products)
    ? productsData.products
    : []

  if (rawProducts.length === 0 && !collectionsData) {
    // The domain responded, but doesn't expose Shopify's public storefront
    // JSON endpoints — almost certainly not a Shopify store.
    return Response.json({ error: 'not_shopify' }, { status: 422 })
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

  const trafficSignals = await fetchTrafficSignals(storeUrl.hostname)
  const trafficBlock = trafficSignals ? `Traffic signals:\n${trafficSignals}` : 'No third-party traffic data available.'

  // Classify store size BEFORE estimating revenue, so the revenue estimate
  // is bounded to a realistic tier instead of defaulting to a small-store
  // number just because we're missing hard traffic data.
  const classificationPrompt = `You are sizing up a Shopify store for a dropshipper competitor-research tool. Classify the store's monthly revenue tier based on the data below.

Store domain: ${storeUrl.hostname}
Number of products found: ${rawProducts.length}
Sample product titles and prices: ${JSON.stringify(topProducts.slice(0, 8).map((p) => ({ title: p.title, price: p.price })))}
Collections / categories: ${JSON.stringify(collectionTitles.slice(0, 15))}
About page excerpt: ${aboutText ?? 'not available'}
${trafficBlock}

Size tiers:
- Micro: under $10,000/month — new or hobbyist store
- Small: $10,000 - $100,000/month — early-stage dropshipping store
- Medium: $100,000 - $1,000,000/month — established, growing brand
- Large: $1,000,000 - $10,000,000/month — well-known regional/national brand
- Enterprise: $10,000,000+/month — major national/global brand

If you recognize this brand from your training data, use your actual knowledge of its real-world scale instead of defaulting to a small estimate just because live traffic data is missing. For example: Gymshark is a major athletic wear brand with hundreds of millions in annual revenue (Enterprise tier). Fashion Nova does over $1B annually (Enterprise tier).

Return ONLY JSON: { "size_tier": "Micro"|"Small"|"Medium"|"Large"|"Enterprise", "known_brand": true|false, "reasoning": "<1-2 sentences>" }`

  let sizeTier: SizeTier = 'Small'
  let classificationReasoning = ''
  try {
    const classification = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: classificationPrompt }],
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(classification.choices[0].message.content!)
    if (typeof parsed.size_tier === 'string' && parsed.size_tier in SIZE_TIERS) {
      sizeTier = parsed.size_tier as SizeTier
    }
    if (typeof parsed.reasoning === 'string') {
      classificationReasoning = parsed.reasoning
    }
  } catch (err) {
    console.error('[store-intelligence] Size classification failed, defaulting to Small:', err)
  }

  const prompt = `You are an expert Shopify store analyst helping a dropshipper size up a competitor. Based on the following REAL scraped data from a live Shopify store, estimate the store's performance and provide actionable insights. Return ONLY a JSON object with no markdown.

Store URL: ${storeUrl.hostname}
Number of products found: ${rawProducts.length}
Top product titles and prices: ${JSON.stringify(topProducts.map((p) => ({ title: p.title, price: p.price })))}
Collections / categories: ${JSON.stringify(collectionTitles.slice(0, 15))}
Oldest product listed date (proxy for store age): ${oldestProductDate ?? 'unknown'}
About page excerpt: ${aboutText ?? 'not available'}
${trafficBlock}

This store has already been classified as ${sizeTier} (${SIZE_TIERS[sizeTier]})${classificationReasoning ? ` — ${classificationReasoning}` : ''}. Your estimated_monthly_revenue MUST fall within this range unless the scraped data gives you strong specific evidence to deviate.

Calibration benchmarks:
- A Shopify store with 1M monthly visitors typically generates $500k-2M/month in revenue.
- A store with 100k visitors generates $50k-200k/month.
- A store with 10k visitors generates $5k-20k/month.

If you have information about this brand from your training data (Gymshark, Allbirds, Fashion Nova, etc.), use that to calibrate your estimate instead of defaulting to a conservative small-store number. Be realistic: Gymshark is a major athletic wear brand with hundreds of millions in annual revenue. Fashion Nova does over $1B annually. Don't underestimate well-known brands just because you only have scraped product-page data.

Return exactly this JSON structure:
{
  "store_name": "<best guess at the brand/store name>",
  "estimated_monthly_revenue": "<realistic range like '$8,000 - $25,000', calibrated to the ${sizeTier} tier above>",
  "estimated_monthly_visitors": "<realistic range like '15,000 - 40,000'>",
  "confidence_level": "<Low|Medium|High>",
  "size_tier": "${sizeTier}",
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

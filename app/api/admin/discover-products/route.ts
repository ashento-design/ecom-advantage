import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const NICHES = [
  'Home Decor', 'Kitchen Gadgets', 'Pet Supplies', 'Beauty & Skincare', 'Fitness',
  'Tech Accessories', 'Baby & Kids', 'Car Accessories', 'Outdoor & Garden',
  'Health & Wellness', 'Phone Accessories', 'Home Office',
]

const TREND_LABELS = ['Hot', 'Trending', 'Rising']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
const ALLOWED_COUNTS = [3, 5, 10]

type DraftProduct = {
  title: string
  description: string
  niche: string
  demand_score: number
  trend_label: string
}

async function findImage(query: string): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey || !query.trim()) return FALLBACK_IMAGE

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return FALLBACK_IMAGE
    const data = await res.json()
    const photo = Array.isArray(data.results) ? data.results[0] : null
    return photo?.urls?.regular || photo?.urls?.small || FALLBACK_IMAGE
  } catch {
    return FALLBACK_IMAGE
  }
}

/**
 * POST /api/admin/discover-products
 * Admin auth required. Body: { niche, count? }. Uses OpenAI to brainstorm
 * `count` plausible winning dropshipping products for the given niche, then
 * finds a relevant Unsplash image for each. Returns the drafts for admin
 * review — nothing is written to the database here.
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let niche: string
  let count: number
  try {
    const body = await request.json()
    niche = body.niche
    count = ALLOWED_COUNTS.includes(Number(body.count)) ? Number(body.count) : 5
    if (!niche || typeof niche !== 'string') throw new Error('missing niche')
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const prompt = `You are an expert dropshipping product researcher. Brainstorm ${count} DIFFERENT, currently-plausible winning dropshipping products in the "${niche}" niche — the kind of products that do well on Shopify stores sold via Facebook/TikTok ads and AliExpress sourcing. Avoid generic or overused examples; think specific, sellable product ideas within this niche. Return ONLY a JSON object with no markdown.

Return exactly this JSON structure:
{
  "products": [
    {
      "title": "<clean, natural, readable product title — no ALL CAPS, no keyword-stuffing, under 80 characters>",
      "description": "<2-3 sentence dropshipper-focused description highlighting demand signals and why it sells>",
      "demand_score": <integer 70-95, based on how strong current demand plausibly is>,
      "trend_label": "<Hot|Trending|Rising>"
    }
  ]
}

The "products" array must contain exactly ${count} items.`

  let drafts: DraftProduct[]
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(completion.choices[0].message.content!)
    const rawProducts = Array.isArray(parsed.products) ? parsed.products : []
    drafts = rawProducts.slice(0, count).map((p: Partial<DraftProduct>) => ({
      title: typeof p.title === 'string' ? p.title : '',
      description: typeof p.description === 'string' ? p.description : '',
      niche: NICHES.includes(niche) ? niche : NICHES[0],
      demand_score: Math.min(95, Math.max(70, Math.round(Number(p.demand_score) || 80))),
      trend_label: TREND_LABELS.includes(p.trend_label as string) ? (p.trend_label as string) : 'Rising',
    })).filter((p: DraftProduct) => p.title)
  } catch (err) {
    console.error('[discover-products] OpenAI generation failed:', err)
    return NextResponse.json({ error: 'discovery_failed' }, { status: 502 })
  }

  if (drafts.length === 0) {
    return NextResponse.json({ error: 'discovery_failed' }, { status: 502 })
  }

  const products = await Promise.all(
    drafts.map(async (draft) => ({
      ...draft,
      image_url: await findImage(draft.title),
    }))
  )

  return NextResponse.json({ products })
}

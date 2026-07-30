import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { parseSafeStoreUrl } from '@/app/lib/urlSafety'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const NICHES = [
  'Home Decor', 'Kitchen Gadgets', 'Pet Supplies', 'Beauty & Skincare', 'Fitness',
  'Tech Accessories', 'Baby & Kids', 'Car Accessories', 'Outdoor & Garden',
  'Health & Wellness', 'Phone Accessories', 'Home Office',
]

function parseAliExpressUrl(input: string): URL | null {
  const url = parseSafeStoreUrl(input)
  if (!url) return null
  if (!/(^|\.)aliexpress\.(com|us|ru)$/i.test(url.hostname)) return null
  if (!url.pathname.includes('/item/')) return null
  return url
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtmlEntities(match[1])
  }
  return null
}

function extractPriceHint(html: string): string | null {
  // Best-effort only — AliExpress renders price client-side, so this rarely
  // matches, but occasionally shows up in embedded JSON or meta tags.
  const match = html.match(/"?(?:formatedPrice|salePrice|minPrice)"?\s*[:=]\s*"?\$?(\d+(?:\.\d{1,2})?)/i)
  return match ? `$${match[1]}` : null
}

async function scrapeAliExpressPage(url: URL): Promise<{ title: string | null; description: string | null; image: string | null; price: string | null } | null> {
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return null
    const html = await res.text()
    if (html.length < 500) return null

    const title = extractMetaContent(html, 'og:title')
    const description = extractMetaContent(html, 'og:description')
    const image = extractMetaContent(html, 'og:image')
    const price = extractPriceHint(html)

    if (!title && !image) return null
    return { title, description, image, price }
  } catch {
    return null
  }
}

function slugHints(url: URL) {
  return url.pathname
    .split('/')
    .join(' ')
    .replace(/\.html?$/i, '')
    .replace(/[0-9]{6,}/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * POST /api/admin/aliexpress-import
 * Admin auth required. Body: { url }. Scrapes an AliExpress product page
 * for og:title/og:description/og:image (best-effort — AliExpress is heavily
 * bot-protected and this often fails), then uses OpenAI to clean up the
 * title, write a dropshipper-focused description, and suggest niche/demand
 * score/trend label. Falls back to inferring everything from the URL slug
 * alone when the page can't be scraped.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let rawUrl: string
  try {
    const body = await request.json()
    rawUrl = body.url
    if (!rawUrl || typeof rawUrl !== 'string') throw new Error('missing url')
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const url = parseAliExpressUrl(rawUrl)
  if (!url) {
    return NextResponse.json({ error: 'invalid_aliexpress_url' }, { status: 400 })
  }

  const scraped = await scrapeAliExpressPage(url)
  const hints = slugHints(url)

  const prompt = scraped
    ? `You are helping an e-commerce admin quickly list a dropshipping product sourced from AliExpress. Based on the REAL scraped data below, produce clean, ready-to-publish listing content. Return ONLY a JSON object with no markdown.

Raw title: ${scraped.title ?? 'not available'}
Raw description: ${scraped.description ?? 'not available'}
Raw price: ${scraped.price ?? 'not available'}
Source URL: ${url.toString()}

Return exactly this JSON structure:
{
  "title": "<clean, natural, readable product title — no ALL CAPS, no excess symbols/emoji/keyword-stuffing, under 80 characters>",
  "description": "<2-3 sentence dropshipper-focused description highlighting demand signals and why it sells>",
  "niche": "<one of exactly: ${NICHES.join(', ')}>",
  "demand_score": <integer 70-95, based on the product category and apparent popularity>,
  "trend_label": "<Hot|Trending|Rising>"
}`
    : `You are helping an e-commerce admin quickly list a dropshipping product from AliExpress, but the page could not be scraped (AliExpress likely blocked the request). Infer the most plausible product listing content from the URL alone — do your best with any descriptive words in the URL slug below. Be transparent in the description that specifics are estimated. Return ONLY a JSON object with no markdown.

Source URL: ${url.toString()}
Words found in the URL slug: ${hints || '(none — URL is just a numeric item ID)'}

Return exactly this JSON structure:
{
  "title": "<best-effort clean, natural, readable product title under 80 characters>",
  "description": "<2-3 sentence dropshipper-focused description>",
  "niche": "<one of exactly: ${NICHES.join(', ')}>",
  "demand_score": <integer 70-95>,
  "trend_label": "<Hot|Trending|Rising>"
}`

  let result: { title: string; description: string; niche: string; demand_score: number; trend_label: string }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    result = JSON.parse(completion.choices[0].message.content!)
  } catch (err) {
    console.error('[aliexpress-import] OpenAI enhancement failed:', err)
    return NextResponse.json({ error: 'analysis_failed' }, { status: 502 })
  }

  const niche = NICHES.includes(result.niche) ? result.niche : NICHES[0]
  const demandScore = Math.min(95, Math.max(70, Math.round(Number(result.demand_score) || 80)))
  const trendLabel = ['Hot', 'Trending', 'Rising'].includes(result.trend_label) ? result.trend_label : 'Rising'

  return NextResponse.json({
    title: result.title || scraped?.title || '',
    description: result.description || scraped?.description || '',
    image_url: scraped?.image || '',
    niche,
    demand_score: demandScore,
    trend_label: trendLabel,
    supplier_url: url.toString(),
    scraped: Boolean(scraped),
  })
}

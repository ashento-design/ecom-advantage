import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'

type UnsplashPhoto = {
  id: string
  urls?: { small?: string; regular?: string }
  alt_description?: string | null
}

/**
 * GET /api/admin/unsplash-search?q=<query>
 * Admin auth required. Proxies the Unsplash search API for the product
 * form's image-suggestion grid. Returns 501 if UNSPLASH_ACCESS_KEY isn't
 * configured.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const query = request.nextUrl.searchParams.get('q')?.trim()
  if (!query) {
    return NextResponse.json({ error: 'missing_query' }, { status: 400 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ error: 'not_configured' }, { status: 501 })
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=squarish`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'unsplash_error' }, { status: 502 })
    }
    const data = await res.json()
    const rawResults: UnsplashPhoto[] = Array.isArray(data.results) ? data.results : []
    const results = rawResults.slice(0, 6).map((photo) => ({
      id: photo.id,
      thumb: photo.urls?.small ?? '',
      full: photo.urls?.regular ?? '',
      alt: photo.alt_description ?? query,
    })).filter((r) => r.thumb && r.full)

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'unsplash_error' }, { status: 502 })
  }
}

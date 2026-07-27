import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '@/app/lib/analytics'
import { createServerClient } from '@/app/lib/supabase'

// Deliberately narrow: this is the only analytics event type accepted from
// the client. product_analyzed / ad_generated / store_analyzed /
// upgrade_clicked are all inserted server-side from their own API routes
// instead, so a client can't spoof business-relevant counters by hitting
// this endpoint directly.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const path = typeof body?.path === 'string' ? body.path.slice(0, 200) : null
  if (!path) {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  let userId: string | null = null
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Anonymous visitor — fine, page views don't require a session.
  }

  await trackEvent('page_view', { userId, metadata: { path } })
  return NextResponse.json({ ok: true })
}

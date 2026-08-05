import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { sendWeeklyDigest } from '@/app/lib/digest'

/**
 * POST /api/email/weekly-digest
 * Admin auth required — manual-only testing route, always sends
 * immediately with no "already sent this week" guard (that guard lives in
 * /api/cron/master, the only scheduled route). Sends the top 5 products to
 * every opted-in user.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const { origin } = new URL(request.url)
    const result = await sendWeeklyDigest(origin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[weekly-digest] Failed to send digest:', err)
    return NextResponse.json({ error: 'digest_send_failed' }, { status: 500 })
  }
}

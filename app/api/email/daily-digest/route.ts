import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { sendDailyDigest } from '@/app/lib/digest'

/**
 * POST /api/email/daily-digest
 * Admin auth required — manual-only testing route, always sends
 * immediately with no "already sent today" guard (that guard lives in
 * /api/cron/master, the only scheduled route). Sends the top 3 products
 * (by Launchory Score) to every opted-in user.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const { origin } = new URL(request.url)
    const result = await sendDailyDigest(origin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[daily-digest] Failed to send digest:', err)
    return NextResponse.json({ error: 'digest_send_failed' }, { status: 500 })
  }
}

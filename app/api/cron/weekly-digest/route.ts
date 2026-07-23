import { NextResponse } from 'next/server'
import { sendWeeklyDigest } from '@/app/lib/digest'

// Called by Vercel Cron (see vercel.json). Vercel automatically sends
// `Authorization: Bearer $CRON_SECRET` on cron-triggered requests when
// CRON_SECRET is set as an env var — reject anything that doesn't match so
// this can't be used to spam every user's inbox by hitting the URL directly.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const { origin } = new URL(request.url)
    const result = await sendWeeklyDigest(origin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron/weekly-digest] Failed to send digest:', err)
    return NextResponse.json({ error: 'digest_send_failed' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { sendOnboardingEmails } from '@/app/lib/onboarding'

// Called by Vercel Cron (see vercel.json), same auth pattern as
// /api/cron/weekly-digest — rejects anything without the matching
// CRON_SECRET bearer token so it can't be triggered by hitting the URL.
// Kept as a standalone route (alongside /api/cron/combined) so it can still
// be triggered manually from the admin panel for testing.
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
    const results = await sendOnboardingEmails(origin)
    return NextResponse.json(results)
  } catch (err) {
    console.error('[cron/onboarding-emails] Failed to send onboarding emails:', err)
    return NextResponse.json({ error: 'onboarding_send_failed' }, { status: 500 })
  }
}

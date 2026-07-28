import { NextResponse } from 'next/server'
import { sendDailyDigest, sendWeeklyDigest } from '@/app/lib/digest'
import { sendOnboardingEmails } from '@/app/lib/onboarding'

// Vercel Hobby plan caps cron jobs at 2, so this single daily cron does the
// work of all three schedules: daily digest + onboarding emails every day,
// plus the weekly digest folded in on Mondays only. The individual
// /api/cron/{weekly-digest,onboarding-emails,daily-digest} routes are kept
// intact for manual/admin-triggered testing — see /api/email/* for those.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { origin } = new URL(request.url)
  const results: Record<string, unknown> = {}

  try {
    results.dailyDigest = await sendDailyDigest(origin)
  } catch (err) {
    console.error('[cron/combined] Daily digest step failed:', err)
    results.dailyDigest = { error: 'failed' }
  }

  try {
    results.onboardingEmails = await sendOnboardingEmails(origin)
  } catch (err) {
    console.error('[cron/combined] Onboarding emails step failed:', err)
    results.onboardingEmails = { error: 'failed' }
  }

  // Monday, per JS Date.getUTCDay() (0 = Sunday, 1 = Monday).
  const isMonday = new Date().getUTCDay() === 1
  if (isMonday) {
    try {
      results.weeklyDigest = await sendWeeklyDigest(origin)
    } catch (err) {
      console.error('[cron/combined] Weekly digest step failed:', err)
      results.weeklyDigest = { error: 'failed' }
    }
  } else {
    results.weeklyDigest = { skipped: 'not_monday' }
  }

  return NextResponse.json(results)
}

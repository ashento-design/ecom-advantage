import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { sendOnboardingEmails } from '@/app/lib/onboarding'

/**
 * POST /api/email/onboarding-emails
 * Admin auth required — manual-only testing route. Not scheduled; the
 * onboarding drip normally runs as part of /api/cron/master. Sends at most
 * one onboarding email per user per call (see app/lib/onboardingSchedule.ts).
 */
export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const { origin } = new URL(request.url)
    const results = await sendOnboardingEmails(origin)
    return NextResponse.json(results)
  } catch (err) {
    console.error('[onboarding-emails] Failed to send onboarding emails:', err)
    return NextResponse.json({ error: 'onboarding_send_failed' }, { status: 500 })
  }
}

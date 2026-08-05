// Shared onboarding drip scheduling logic — used by both the master cron
// (app/lib/masterCron.ts) and the legacy manual-trigger route
// (app/lib/onboarding.ts, called from /api/email/onboarding-emails) so
// there's exactly one definition of "which email is this user due for" and
// both callers cap it at one send per user per invocation.

export type OnboardingProfile = {
  id: string
  plan: string
  analyses_used: number | null
  created_at: string
}

// email_number -> onboarding step. Numbers match the onboarding_emails
// table (1 = welcome, sent separately at signup, not part of this drip).
export const ONBOARDING_STEPS = [
  { number: 2, minDays: 2, type: 'day2' },
  { number: 3, minDays: 4, type: 'day4' },
  { number: 4, minDays: 6, type: 'day6' },
  { number: 5, minDays: 8, type: 'day8' },
] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

// Truncates to UTC calendar-day boundaries before diffing, so "days since
// signup" is a whole-day integer unaffected by what time of day either
// timestamp falls on — a user who signed up at 23:59 UTC and one who signed
// up at 00:01 UTC the same day are both "day 0" until the next UTC midnight.
export function daysSinceSignupUTC(createdAt: string): number {
  const signup = new Date(createdAt)
  const signupMidnight = Date.UTC(signup.getUTCFullYear(), signup.getUTCMonth(), signup.getUTCDate())
  const now = new Date()
  const todayMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((todayMidnight - signupMidnight) / 86400000)
}

function isStepEligible(step: OnboardingStep, profile: OnboardingProfile): boolean {
  if (step.number === 2) return (profile.analyses_used ?? 0) === 0
  if (step.number === 5) return profile.plan === 'free'
  return true
}

// Walks the steps in day order and returns the single next one this user is
// due for — already-sent and permanently-ineligible steps (e.g. day2 for
// someone who already ran an analysis) are skipped over rather than
// blocking later steps, so a user who doesn't qualify for day2 can still
// get day4 on time. Stops at the first step that isn't due yet, since
// minDays only increases, so nothing later can be due either — this is what
// caps every caller at sending at most one onboarding email per user per
// call, with graceful catch-up on the next call.
export function resolveNextOnboardingStep(profile: OnboardingProfile, sentNumbers: Set<number>): OnboardingStep | null {
  const daysSince = daysSinceSignupUTC(profile.created_at)
  for (const step of ONBOARDING_STEPS) {
    if (sentNumbers.has(step.number)) continue
    if (!isStepEligible(step, profile)) continue
    if (daysSince < step.minDays) break
    return step
  }
  return null
}

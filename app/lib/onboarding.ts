import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import {
  sendOnboardingDay2Email,
  sendOnboardingDay4Email,
  sendOnboardingDay6Email,
  sendOnboardingDay8Email,
  type FeedProductSummary,
} from '@/app/lib/emails'
import { resolveNextOnboardingStep } from '@/app/lib/onboardingSchedule'

type SupabaseAdmin = ReturnType<typeof getServiceRoleClient>

async function getTopProduct(supabaseAdmin: SupabaseAdmin): Promise<FeedProductSummary | null> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, title, image_url, demand_score')
    .order('demand_score', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

async function getTopProducts(supabaseAdmin: SupabaseAdmin, count: number): Promise<FeedProductSummary[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, title, image_url, demand_score')
    .order('demand_score', { ascending: false })
    .limit(count)
  return data ?? []
}

// Manual-trigger version of the onboarding drip (called from the admin
// panel's "Onboarding Emails" test button via /api/email/onboarding-emails
// — the scheduled version lives in app/lib/masterCron.ts, which shares the
// same step-resolution logic from app/lib/onboardingSchedule.ts). Sends at
// most ONE onboarding email per user per call — a user behind on the
// sequence gets their next-due email now and the rest on subsequent calls,
// exactly like the scheduled cron, so triggering this manually can never
// stack multiple emails on one user.
export async function sendOnboardingEmails(origin: string) {
  const supabaseAdmin = getServiceRoleClient()

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, plan, analyses_used, created_at')
    .order('created_at', { ascending: true })

  if (profilesError) {
    console.error('[onboarding-emails] Failed to load profiles:', profilesError.message)
    return { sent: 0, skipped: 0, failed: 0, by_type: {} as Record<string, number> }
  }

  const candidates = profiles ?? []
  const candidateIds = candidates.map((c) => c.id)
  const sentByUser = new Map<string, Set<number>>()
  if (candidateIds.length > 0) {
    const { data: sentRows } = await supabaseAdmin
      .from('onboarding_emails')
      .select('user_id, email_number')
      .in('user_id', candidateIds)
    for (const row of sentRows ?? []) {
      if (!sentByUser.has(row.user_id)) sentByUser.set(row.user_id, new Set())
      sentByUser.get(row.user_id)!.add(row.email_number)
    }
  }

  let day2Product: FeedProductSummary | null | undefined
  let day6Products: FeedProductSummary[] | undefined

  let sent = 0
  let skipped = 0
  let failed = 0
  const byType: Record<string, number> = {}

  for (const profile of candidates) {
    if (!profile.email) {
      skipped += 1
      continue
    }

    const sentNumbers = sentByUser.get(profile.id) ?? new Set<number>()
    const step = resolveNextOnboardingStep(profile, sentNumbers)
    if (!step) {
      skipped += 1
      continue
    }

    try {
      if (step.number === 2) {
        if (day2Product === undefined) day2Product = await getTopProduct(supabaseAdmin)
        if (!day2Product) { skipped += 1; continue }
        await sendOnboardingDay2Email(profile.email, profile.full_name ?? '', day2Product, origin)
      } else if (step.number === 3) {
        await sendOnboardingDay4Email(profile.email, profile.full_name ?? '', origin)
      } else if (step.number === 4) {
        if (day6Products === undefined) day6Products = await getTopProducts(supabaseAdmin, 3)
        if (!day6Products.length) { skipped += 1; continue }
        await sendOnboardingDay6Email(profile.email, profile.full_name ?? '', day6Products, origin)
      } else {
        await sendOnboardingDay8Email(profile.email, profile.full_name ?? '', profile.analyses_used ?? 0, origin)
      }

      const { error: trackError } = await supabaseAdmin
        .from('onboarding_emails')
        .insert({ user_id: profile.id, email_number: step.number })
      if (trackError) throw trackError

      sent += 1
      byType[step.type] = (byType[step.type] ?? 0) + 1
    } catch (err) {
      console.error(`[onboarding-emails] Failed to send ${step.type} to ${profile.email}:`, err)
      failed += 1
    }
  }

  return { sent, skipped, failed, by_type: byType }
}

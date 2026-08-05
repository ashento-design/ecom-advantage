import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import {
  sendOnboardingDay2Email,
  sendOnboardingDay4Email,
  sendOnboardingDay6Email,
  sendOnboardingDay8Email,
  type FeedProductSummary,
} from '@/app/lib/emails'
import { sendDailyDigestEmail, sendWeeklyDigestEmail } from '@/app/lib/email'
import { computeLaunchoryScore } from '@/app/lib/launchoryScore'
import { resolveNextOnboardingStep } from '@/app/lib/onboardingSchedule'

const GLOBAL_EMAIL_LIMIT = 500
const DAILY_TOP_COUNT = 3
const WEEKLY_TOP_COUNT = 5

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  plan: string
  analyses_used: number | null
  created_at: string
  email_preferences: { weekly_digest?: boolean; daily_digest?: boolean } | null
}

type Attempt = { user_id: string; email_type: string; action: 'send' | 'skip'; reason: string }

// Shows enough of the address to spot-check in logs without putting a full
// email address in plaintext server logs.
function maskEmail(email: string) {
  return `${email.slice(0, 3)}***`
}

function emailsEnabled() {
  // Defaults to enabled so the feature works without requiring anyone to
  // remember to set the var — set EMAILS_ENABLED=false to pause all sends.
  return process.env.EMAILS_ENABLED !== 'false'
}

function getTodayStartUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function getWeekStartUTC(): Date {
  const todayStart = getTodayStartUTC()
  const day = todayStart.getUTCDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? 6 : day - 1
  return new Date(todayStart.getTime() - diffToMonday * 86400000)
}

export type MasterCronResult = {
  dry_run: boolean
  emails_enabled: boolean
  onboarding_sent: number
  daily_sent: number
  weekly_sent: number
  total_sent: number
  errors: string[]
  would_send: { user_id: string; email_type: string; reason: string }[]
  would_skip: { user_id: string; email_type: string; reason: string }[]
}

/**
 * The single source of truth for every scheduled email send. Runs the
 * onboarding drip, then the daily digest, then the weekly digest (Mondays
 * only), sharing one per-user-per-run guard and one global rate limit
 * across all three so a user never gets stacked with multiple emails from
 * one invocation, and one run never sends more than GLOBAL_EMAIL_LIMIT
 * total. With dryRun: true, every decision is made and logged exactly the
 * same way, but no email is actually sent and nothing is written to
 * onboarding_emails or cron_runs.
 */
export async function runMasterCron({ origin, dryRun }: { origin: string; dryRun: boolean }): Promise<MasterCronResult> {
  const supabaseAdmin = getServiceRoleClient()
  const attempts: Attempt[] = []
  const sentThisRun = new Set<string>()
  const errors: string[] = []
  let totalSent = 0
  let onboardingSent = 0
  let dailySent = 0
  let weeklySent = 0

  const enabled = emailsEnabled()
  if (!enabled) {
    console.log('[cron/master] EMAILS_ENABLED=false — skipping all sends this run')
  }

  function withinGlobalLimit() {
    return totalSent < GLOBAL_EMAIL_LIMIT
  }

  function recordSkip(userId: string, emailType: string, reason: string) {
    attempts.push({ user_id: userId, email_type: emailType, action: 'skip', reason })
  }

  function recordSend(userId: string, emailType: string, reason: string) {
    attempts.push({ user_id: userId, email_type: emailType, action: 'send', reason })
    sentThisRun.add(userId)
    totalSent += 1
  }

  // ---- Shared data, loaded once ----
  const { data: profilesRaw, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, plan, analyses_used, created_at, email_preferences')
    .order('created_at', { ascending: true })

  if (profilesError) {
    errors.push(`Failed to load profiles: ${profilesError.message}`)
  }
  const allProfiles = (profilesRaw ?? []) as Profile[]

  const profileIds = allProfiles.map((p) => p.id)
  const sentByUser = new Map<string, Set<number>>()
  if (profileIds.length > 0) {
    const { data: sentRows, error: sentRowsError } = await supabaseAdmin
      .from('onboarding_emails')
      .select('user_id, email_number')
      .in('user_id', profileIds)
    if (sentRowsError) {
      errors.push(`Failed to load onboarding_emails: ${sentRowsError.message}`)
    }
    for (const row of sentRows ?? []) {
      if (!sentByUser.has(row.user_id)) sentByUser.set(row.user_id, new Set())
      sentByUser.get(row.user_id)!.add(row.email_number)
    }
  }

  // ---- Step 1: onboarding drip — at most one email per user this run ----
  let day2Product: FeedProductSummary | null | undefined
  let day6Products: FeedProductSummary[] | undefined

  async function getDay2Product() {
    if (day2Product !== undefined) return day2Product
    const { data } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, demand_score')
      .order('demand_score', { ascending: false })
      .limit(1)
      .maybeSingle()
    day2Product = data ?? null
    return day2Product
  }

  async function getDay6Products() {
    if (day6Products !== undefined) return day6Products
    const { data } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, demand_score')
      .order('demand_score', { ascending: false })
      .limit(3)
    day6Products = data ?? []
    return day6Products
  }

  if (!enabled) {
    for (const profile of allProfiles) recordSkip(profile.id, 'onboarding', 'emails_disabled')
  } else {
    for (const profile of allProfiles) {
      if (!profile.email) { recordSkip(profile.id, 'onboarding', 'no_email'); continue }
      if (sentThisRun.has(profile.id)) { recordSkip(profile.id, 'onboarding', 'per_user_rate_limit'); continue }
      if (!withinGlobalLimit()) { recordSkip(profile.id, 'onboarding', 'global_rate_limit'); continue }

      const sentNumbers = sentByUser.get(profile.id) ?? new Set<number>()
      const step = resolveNextOnboardingStep(profile, sentNumbers)
      if (!step) { recordSkip(profile.id, 'onboarding', 'not_due_or_complete'); continue }

      console.log(`[cron/master] ${dryRun ? 'DRY RUN — would send' : 'sending'} ${step.type} to ${maskEmail(profile.email)}`)

      if (dryRun) {
        recordSend(profile.id, step.type, 'due')
        onboardingSent += 1
        continue
      }

      try {
        if (step.number === 2) {
          const product = await getDay2Product()
          if (!product) { recordSkip(profile.id, step.type, 'no_products_available'); continue }
          await sendOnboardingDay2Email(profile.email, profile.full_name ?? '', product, origin)
        } else if (step.number === 3) {
          await sendOnboardingDay4Email(profile.email, profile.full_name ?? '', origin)
        } else if (step.number === 4) {
          const products = await getDay6Products()
          if (!products.length) { recordSkip(profile.id, step.type, 'no_products_available'); continue }
          await sendOnboardingDay6Email(profile.email, profile.full_name ?? '', products, origin)
        } else {
          await sendOnboardingDay8Email(profile.email, profile.full_name ?? '', profile.analyses_used ?? 0, origin)
        }

        const { error: trackError } = await supabaseAdmin
          .from('onboarding_emails')
          .insert({ user_id: profile.id, email_number: step.number })
        if (trackError) throw trackError

        recordSend(profile.id, step.type, 'due')
        onboardingSent += 1
        console.log(`[cron/master] sent ${step.type} to ${maskEmail(profile.email)}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[cron/master] FAILED to send ${step.type} to ${maskEmail(profile.email)}: ${message}`)
        errors.push(`${step.type} to user ${profile.id}: ${message}`)
        recordSkip(profile.id, step.type, 'send_failed')
      }
    }
  }

  // ---- Step 2: daily digest — once per calendar day (UTC) ----
  let dailyAlreadySentToday = false
  if (enabled) {
    const { data: existingDaily } = await supabaseAdmin
      .from('cron_runs')
      .select('id')
      .gt('daily_sent', 0)
      .gte('run_at', getTodayStartUTC().toISOString())
      .limit(1)
    dailyAlreadySentToday = (existingDaily ?? []).length > 0
  }

  if (!enabled) {
    recordSkip('*', 'daily_digest', 'emails_disabled')
  } else if (dailyAlreadySentToday) {
    recordSkip('*', 'daily_digest', 'already_sent_today')
  } else {
    const { data: dailyProductsRaw, error: dailyProductsError } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, demand_score, views, saves_count, trend_label')

    if (dailyProductsError) {
      errors.push(`Failed to load products for daily digest: ${dailyProductsError.message}`)
    }

    const dailyProducts = [...(dailyProductsRaw ?? [])]
      .sort((a, b) => computeLaunchoryScore(b).score - computeLaunchoryScore(a).score)
      .slice(0, DAILY_TOP_COUNT)
      .map((p) => ({ id: p.id, title: p.title, image_url: p.image_url, demand_score: p.demand_score }))

    if (dailyProducts.length === 0) {
      recordSkip('*', 'daily_digest', 'no_products_available')
    } else {
      for (const profile of allProfiles) {
        if (!profile.email) { recordSkip(profile.id, 'daily_digest', 'no_email'); continue }
        const wantsDigest = profile.email_preferences?.daily_digest ?? false
        if (!wantsDigest) { recordSkip(profile.id, 'daily_digest', 'not_opted_in'); continue }
        if (sentThisRun.has(profile.id)) { recordSkip(profile.id, 'daily_digest', 'per_user_rate_limit'); continue }
        if (!withinGlobalLimit()) { recordSkip(profile.id, 'daily_digest', 'global_rate_limit'); continue }

        console.log(`[cron/master] ${dryRun ? 'DRY RUN — would send' : 'sending'} daily_digest to ${maskEmail(profile.email)}`)

        if (dryRun) {
          recordSend(profile.id, 'daily_digest', 'opted_in')
          dailySent += 1
          continue
        }

        try {
          await sendDailyDigestEmail(profile.email, profile.full_name ?? '', dailyProducts, origin)
          recordSend(profile.id, 'daily_digest', 'opted_in')
          dailySent += 1
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`[cron/master] FAILED daily_digest to ${maskEmail(profile.email)}: ${message}`)
          errors.push(`daily_digest to user ${profile.id}: ${message}`)
          recordSkip(profile.id, 'daily_digest', 'send_failed')
        }
      }
    }
  }

  // ---- Step 3: weekly digest — Mondays only, once per week (UTC) ----
  const isMonday = new Date().getUTCDay() === 1
  let weeklyAlreadySentThisWeek = false
  if (enabled && isMonday) {
    const { data: existingWeekly } = await supabaseAdmin
      .from('cron_runs')
      .select('id')
      .gt('weekly_sent', 0)
      .gte('run_at', getWeekStartUTC().toISOString())
      .limit(1)
    weeklyAlreadySentThisWeek = (existingWeekly ?? []).length > 0
  }

  if (!isMonday) {
    recordSkip('*', 'weekly_digest', 'not_monday')
  } else if (!enabled) {
    recordSkip('*', 'weekly_digest', 'emails_disabled')
  } else if (weeklyAlreadySentThisWeek) {
    recordSkip('*', 'weekly_digest', 'already_sent_this_week')
  } else {
    const { data: weeklyProducts, error: weeklyProductsError } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, demand_score')
      .order('demand_score', { ascending: false })
      .limit(WEEKLY_TOP_COUNT)

    if (weeklyProductsError) {
      errors.push(`Failed to load products for weekly digest: ${weeklyProductsError.message}`)
    }

    if (!weeklyProducts || weeklyProducts.length === 0) {
      recordSkip('*', 'weekly_digest', 'no_products_available')
    } else {
      for (const profile of allProfiles) {
        if (!profile.email) { recordSkip(profile.id, 'weekly_digest', 'no_email'); continue }
        const wantsDigest = profile.email_preferences?.weekly_digest ?? true
        if (!wantsDigest) { recordSkip(profile.id, 'weekly_digest', 'not_opted_in'); continue }
        if (sentThisRun.has(profile.id)) { recordSkip(profile.id, 'weekly_digest', 'per_user_rate_limit'); continue }
        if (!withinGlobalLimit()) { recordSkip(profile.id, 'weekly_digest', 'global_rate_limit'); continue }

        console.log(`[cron/master] ${dryRun ? 'DRY RUN — would send' : 'sending'} weekly_digest to ${maskEmail(profile.email)}`)

        if (dryRun) {
          recordSend(profile.id, 'weekly_digest', 'opted_in')
          weeklySent += 1
          continue
        }

        try {
          await sendWeeklyDigestEmail(profile.email, profile.full_name ?? '', weeklyProducts, origin)
          recordSend(profile.id, 'weekly_digest', 'opted_in')
          weeklySent += 1
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`[cron/master] FAILED weekly_digest to ${maskEmail(profile.email)}: ${message}`)
          errors.push(`weekly_digest to user ${profile.id}: ${message}`)
          recordSkip(profile.id, 'weekly_digest', 'send_failed')
        }
      }
    }
  }

  // ---- Step 4: log the run (real runs only — a dry run must never affect
  // the "already sent today/this week" checks a future real run makes) ----
  if (!dryRun) {
    const { error: insertError } = await supabaseAdmin.from('cron_runs').insert({
      run_at: new Date().toISOString(),
      onboarding_sent: onboardingSent,
      daily_sent: dailySent,
      weekly_sent: weeklySent,
      errors,
    })
    if (insertError) {
      console.error('[cron/master] Failed to log cron_runs record:', insertError.message)
      errors.push(`Failed to log cron_runs: ${insertError.message}`)
    }
  }

  return {
    dry_run: dryRun,
    emails_enabled: enabled,
    onboarding_sent: onboardingSent,
    daily_sent: dailySent,
    weekly_sent: weeklySent,
    total_sent: totalSent,
    errors,
    would_send: attempts.filter((a) => a.action === 'send').map(({ user_id, email_type, reason }) => ({ user_id, email_type, reason })),
    would_skip: attempts.filter((a) => a.action === 'skip').map(({ user_id, email_type, reason }) => ({ user_id, email_type, reason })),
  }
}

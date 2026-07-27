import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import {
  sendOnboardingDay2Email,
  sendOnboardingDay4Email,
  sendOnboardingDay6Email,
  sendOnboardingDay8Email,
  type FeedProductSummary,
} from '@/app/lib/emails'

type SupabaseAdmin = ReturnType<typeof getServiceRoleClient>

// Maps onboarding_emails.email_number -> minimum days since signup before
// it's due. Email 1 (welcome) is sent immediately at signup by
// /api/email/welcome, not by this cron.
const STEPS = [2, 3, 4, 5] as const
const MIN_DAYS: Record<(typeof STEPS)[number], number> = { 2: 2, 3: 4, 4: 6, 5: 8 }

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

// Called by Vercel Cron (see vercel.json), same auth pattern as
// /api/cron/weekly-digest — rejects anything without the matching
// CRON_SECRET bearer token so it can't be triggered by hitting the URL.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let supabaseAdmin: SupabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch (err) {
    console.error('[cron/onboarding-emails] getServiceRoleClient() failed:', err)
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { origin } = new URL(request.url)
  const results: Record<string, { sent: number; skipped: number; failed: number }> = {}

  // Cached across recipients within a single run so we don't re-query the
  // feed once per user.
  let day2Product: FeedProductSummary | null = null
  let day6Products: FeedProductSummary[] | null = null

  for (const emailNumber of STEPS) {
    const cutoff = new Date()
    cutoff.setUTCDate(cutoff.getUTCDate() - MIN_DAYS[emailNumber])

    // Scans all profiles old enough for this step, same unbounded-scan
    // pattern as sendWeeklyDigest — fine at current scale, and staying
    // unbounded means a user is still caught up correctly even if the cron
    // was broken or paused for a while.
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, plan, analyses_used, created_at')
      .lte('created_at', cutoff.toISOString())

    if (candidatesError) {
      console.error(`[cron/onboarding-emails] Failed to load candidates for email ${emailNumber}:`, candidatesError.message)
      results[`email_${emailNumber}`] = { sent: 0, skipped: 0, failed: 0 }
      continue
    }

    const candidateIds = (candidates ?? []).map((c) => c.id)
    const alreadySentIds = new Set<string>()
    if (candidateIds.length > 0) {
      const { data: alreadySent } = await supabaseAdmin
        .from('onboarding_emails')
        .select('user_id')
        .eq('email_number', emailNumber)
        .in('user_id', candidateIds)
      for (const row of alreadySent ?? []) alreadySentIds.add(row.user_id)
    }

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const profile of candidates ?? []) {
      if (alreadySentIds.has(profile.id) || !profile.email) {
        skipped += 1
        continue
      }
      // Email 2: only for users who haven't run an analysis yet.
      if (emailNumber === 2 && (profile.analyses_used ?? 0) > 0) {
        skipped += 1
        continue
      }
      // Email 5: only makes sense as an upgrade push for free-plan users.
      if (emailNumber === 5 && profile.plan !== 'free') {
        skipped += 1
        continue
      }

      try {
        if (emailNumber === 2) {
          if (!day2Product) day2Product = await getTopProduct(supabaseAdmin)
          if (!day2Product) { skipped += 1; continue }
          await sendOnboardingDay2Email(profile.email, profile.full_name ?? '', day2Product, origin)
        } else if (emailNumber === 3) {
          await sendOnboardingDay4Email(profile.email, profile.full_name ?? '', origin)
        } else if (emailNumber === 4) {
          if (!day6Products) day6Products = await getTopProducts(supabaseAdmin, 3)
          if (!day6Products || day6Products.length === 0) { skipped += 1; continue }
          await sendOnboardingDay6Email(profile.email, profile.full_name ?? '', day6Products, origin)
        } else {
          await sendOnboardingDay8Email(profile.email, profile.full_name ?? '', profile.analyses_used ?? 0, origin)
        }

        const { error: trackError } = await supabaseAdmin
          .from('onboarding_emails')
          .insert({ user_id: profile.id, email_number: emailNumber })
        if (trackError) throw trackError

        sent += 1
      } catch (err) {
        console.error(`[cron/onboarding-emails] Failed to send email ${emailNumber} to ${profile.email}:`, err)
        failed += 1
      }
    }

    results[`email_${emailNumber}`] = { sent, skipped, failed }
  }

  return NextResponse.json(results)
}

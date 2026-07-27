import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

type WaitlistRow = {
  id: string
  referral_code: string | null
  referred_by: string | null
  created_at: string
}

export type WaitlistRankEntry = {
  id: string
  referralCount: number
  rank: number
}

// Ranks the whole waitlist by referral count first (top referrers get
// bumped to the front of the line), then by signup time. This is
// recomputed on demand rather than stored as a column, since a
// subscriber's position shifts as new referrals come in after they sign up.
export async function computeWaitlistRanking(): Promise<{ ranking: WaitlistRankEntry[]; total: number }> {
  const supabaseAdmin = getServiceRoleClient()

  const { data, error } = await supabaseAdmin
    .from('waitlist_subscribers')
    .select('id, referral_code, referred_by, created_at')
    .order('created_at', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as WaitlistRow[]

  const referralCountByCode = new Map<string, number>()
  for (const row of rows) {
    if (row.referred_by) {
      referralCountByCode.set(row.referred_by, (referralCountByCode.get(row.referred_by) ?? 0) + 1)
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const aCount = a.referral_code ? referralCountByCode.get(a.referral_code) ?? 0 : 0
    const bCount = b.referral_code ? referralCountByCode.get(b.referral_code) ?? 0 : 0
    if (aCount !== bCount) return bCount - aCount
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const ranking: WaitlistRankEntry[] = sorted.map((row, i) => ({
    id: row.id,
    referralCount: row.referral_code ? referralCountByCode.get(row.referral_code) ?? 0 : 0,
    rank: i + 1,
  }))

  return { ranking, total: rows.length }
}

export async function getSubscriberStanding(subscriberId: string): Promise<{ position: number; referralCount: number; total: number }> {
  const { ranking, total } = await computeWaitlistRanking()
  const entry = ranking.find((r) => r.id === subscriberId)
  return {
    position: entry?.rank ?? total,
    referralCount: entry?.referralCount ?? 0,
    total,
  }
}

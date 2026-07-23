import { NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

const PRO_MONTHLY_PRICE = 29

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const [{ count: totalProducts }, { count: totalUsers }, { count: totalProUsers }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabaseAdmin.from('profiles').select('analyses_used, ads_generated'),
  ])

  const totalAnalyses = (profiles ?? []).reduce((sum, p) => sum + (p.analyses_used ?? 0), 0)
  const totalAdsGenerated = (profiles ?? []).reduce((sum, p) => sum + (p.ads_generated ?? 0), 0)

  return NextResponse.json({
    totalProducts: totalProducts ?? 0,
    totalUsers: totalUsers ?? 0,
    totalAnalyses,
    totalProUsers: totalProUsers ?? 0,
    estimatedMRR: (totalProUsers ?? 0) * PRO_MONTHLY_PRICE,
    totalAdsGenerated,
  })
}

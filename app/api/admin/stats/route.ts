import { NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

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

  const [{ count: totalProducts }, { count: totalUsers }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('analyses_used'),
  ])

  const totalAnalyses = (profiles ?? []).reduce((sum, p) => sum + (p.analyses_used ?? 0), 0)

  return NextResponse.json({
    totalProducts: totalProducts ?? 0,
    totalUsers: totalUsers ?? 0,
    totalAnalyses,
  })
}

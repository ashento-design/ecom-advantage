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

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, plan, analyses_used, ads_generated, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // last_sign_in_at only lives on auth.users, not profiles — pull it from
  // the admin auth API and merge in by id. Best-effort: if this fails, the
  // user list still renders, just without a "last active" column.
  let lastActiveById: Record<string, string | null> = {}
  try {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    lastActiveById = Object.fromEntries(
      (authUsers?.users ?? []).map((u) => [u.id, u.last_sign_in_at ?? null])
    )
  } catch (err) {
    console.error('[admin/users] Failed to load last_sign_in_at from auth.admin.listUsers:', err)
  }

  const enriched = (data ?? []).map((p) => ({ ...p, last_active: lastActiveById[p.id] ?? null }))

  return NextResponse.json(enriched)
}

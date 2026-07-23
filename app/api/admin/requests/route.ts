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
    .from('product_requests')
    .select('id, user_id, product_name, product_url, reason, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // product_requests.user_id has no FK to profiles (it references
  // auth.users directly), so PostgREST can't embed profiles automatically —
  // fetch emails separately and merge them in.
  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id)))
  let emailById: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .in('id', userIds)
    emailById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.email]))
  }

  const enriched = (data ?? []).map((r) => ({ ...r, email: emailById[r.user_id] ?? null }))

  return NextResponse.json(enriched)
}

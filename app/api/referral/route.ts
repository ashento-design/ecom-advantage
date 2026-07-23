import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
  }

  // Counting rows referred by this user reads other users' profile rows,
  // which the "own row only" RLS policy on profiles blocks — use the
  // service-role client for this one aggregate count.
  let referralCount = 0
  try {
    const supabaseAdmin = getServiceRoleClient()
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', user.id)
    referralCount = count ?? 0
  } catch (err) {
    console.error('[referral] Failed to count referred users:', err)
  }

  return NextResponse.json({ referralCode: profile.referral_code, referralCount })
}

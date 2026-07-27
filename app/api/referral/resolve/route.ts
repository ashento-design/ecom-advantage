import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

/**
 * GET /api/referral/resolve?code=<code>
 * Public — no auth required. Looks up which user a referral code belongs
 * to, so signup can attribute the new account to its referrer.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (error) {
    console.error('[referral/resolve] Failed to look up referral code:', error.message)
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ referrerId: data.id })
}

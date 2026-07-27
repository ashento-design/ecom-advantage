import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

export async function GET() {
  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { count, error } = await supabaseAdmin
    .from('waitlist_subscribers')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: count ?? 0 })
}

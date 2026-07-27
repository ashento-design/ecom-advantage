import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/app/lib/email'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = body?.email
  const name = body?.name ?? ''

  if (!email) {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const { origin } = new URL(request.url)

  try {
    await sendWelcomeEmail(email, name, origin)
  } catch (err) {
    console.error('Failed to send welcome email:', err)
    return NextResponse.json({ error: 'email_send_failed' }, { status: 500 })
  }

  // Best-effort: record email 1 of the onboarding drip sequence so the
  // /api/cron/onboarding-emails job knows not to treat this user as brand
  // new when it later checks who's still owed email 1.
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const supabaseAdmin = getServiceRoleClient()
      await supabaseAdmin.from('onboarding_emails').upsert(
        { user_id: user.id, email_number: 1 },
        { onConflict: 'user_id,email_number', ignoreDuplicates: true }
      )
    }
  } catch (err) {
    console.error('Failed to record onboarding email 1 (welcome email still sent):', err)
  }

  return NextResponse.json({ sent: true })
}

import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { sendVideoWaitlistConfirmationEmail } from '@/app/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/video-waitlist
 * Public — no auth required. Body: { email }. Saves the email to
 * video_waitlist (used to gauge interest before building the Video Ad
 * Generator feature) and sends a confirmation email.
 */
export async function POST(request: Request) {
  let email: string
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { error: insertError } = await supabaseAdmin
    .from('video_waitlist')
    .insert({ email })

  if (insertError && insertError.code !== '23505') {
    console.error('[video-waitlist] Insert failed:', insertError)
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 500 })
  }

  // Duplicate signups (23505 = unique violation) are treated as success —
  // no need to tell someone they're "already on the list" as an error.
  try {
    await sendVideoWaitlistConfirmationEmail(email)
  } catch (err) {
    console.error('[video-waitlist] Failed to send confirmation email (still returning success):', err)
  }

  return NextResponse.json({ success: true })
}

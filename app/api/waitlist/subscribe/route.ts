import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { sendWaitlistConfirmationEmail } from '@/app/lib/email'
import { getSubscriberStanding } from '@/app/lib/waitlist'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/waitlist/subscribe
 * Public — no auth required. Body: { email, name?, source?, ref? }.
 * Validates and dedupes the email, attributes it to a referrer if `ref`
 * resolves to an existing subscriber's code, sends the confirmation email,
 * and returns the caller's position on the list.
 */
export async function POST(request: Request) {
  let email: string, name: string | null, source: string | null, ref: string | null
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null
    source = typeof body.source === 'string' && body.source.trim() ? body.source.trim() : null
    ref = typeof body.ref === 'string' && body.ref.trim() ? body.ref.trim().toUpperCase() : null
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

  const { data: existing } = await supabaseAdmin
    .from('waitlist_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    try {
      const { position } = await getSubscriberStanding(existing.id)
      return NextResponse.json({ success: true, position, alreadySubscribed: true })
    } catch (err) {
      console.error('[waitlist/subscribe] Failed to compute standing for existing subscriber:', err)
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }
  }

  let referredByCode: string | null = null
  if (ref) {
    const { data: referrer } = await supabaseAdmin
      .from('waitlist_subscribers')
      .select('referral_code')
      .eq('referral_code', ref)
      .maybeSingle()
    referredByCode = referrer?.referral_code ?? null
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('waitlist_subscribers')
    .insert({ email, name, source, referred_by: referredByCode })
    .select('id, referral_code')
    .single()

  if (insertError || !inserted) {
    // Race-safety net: a duplicate email that slipped past the check above
    // (near-simultaneous double submit) hits the UNIQUE constraint —
    // treat it the same as "already subscribed" instead of a raw DB error.
    if (insertError?.code === '23505') {
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }
    console.error('[waitlist/subscribe] Insert failed:', insertError)
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 500 })
  }

  let position = 1
  let referralCount = 0
  try {
    const standing = await getSubscriberStanding(inserted.id)
    position = standing.position
    referralCount = standing.referralCount
  } catch (err) {
    console.error('[waitlist/subscribe] Failed to compute position (still returning success):', err)
  }

  try {
    const { origin } = new URL(request.url)
    await sendWaitlistConfirmationEmail(email, name, {
      position,
      referralCode: inserted.referral_code,
      referralCount,
      siteUrl: origin,
    })
  } catch (err) {
    console.error('[waitlist/subscribe] Failed to send confirmation email (still returning success):', err)
  }

  return NextResponse.json({ success: true, position })
}

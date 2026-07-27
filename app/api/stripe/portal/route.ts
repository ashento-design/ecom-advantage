import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'

/**
 * POST /api/stripe/portal
 * Auth required. Creates a Stripe Billing Portal session so the current
 * user can manage or cancel their subscription, and returns its URL.
 * Looks the Stripe customer up by email (checkout creates one
 * automatically) since we don't persist a stripe_customer_id.
 */
export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.error('Stripe portal misconfigured: missing STRIPE_SECRET_KEY env var')
    return NextResponse.json({ error: 'Stripe is not configured on the server' }, { status: 500 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const stripe = new Stripe(secretKey)
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customer = customers.data[0]

    if (!customer) {
      return NextResponse.json({ error: 'no_stripe_customer' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://launchory.io/account',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Unexpected error creating billing portal session'
    console.error('Stripe billing portal session creation failed:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

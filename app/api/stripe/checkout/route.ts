import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID

  if (!secretKey || !priceId) {
    console.error('Stripe checkout misconfigured: missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID env var')
    return NextResponse.json({ error: 'Stripe is not configured on the server' }, { status: 500 })
  }

  if (!secretKey.startsWith('sk_')) {
    console.error(
      `Stripe checkout misconfigured: STRIPE_SECRET_KEY has prefix "${secretKey.slice(0, 3)}_", expected "sk_". ` +
      'Get a real secret key from the Stripe Dashboard under Developers > API keys (it starts with sk_test_ or sk_live_).'
    )
    return NextResponse.json(
      { error: 'Stripe secret key is invalid. It must start with sk_test_ or sk_live_.' },
      { status: 500 }
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { origin } = new URL(request.url)

  try {
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: { user_id: user.id },
    })

    if (!session.url) {
      console.error('Stripe checkout session created without a URL', session.id)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Unexpected error creating checkout session'
    console.error('Stripe checkout session creation failed:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

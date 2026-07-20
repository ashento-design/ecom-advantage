import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { origin } = new URL(request.url)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/?payment=success`,
    cancel_url: `${origin}/?payment=cancelled`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}

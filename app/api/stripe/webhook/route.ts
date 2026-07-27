import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendUpgradeConfirmationEmail } from '@/app/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/stripe/webhook
 * Called by Stripe only — verified via the `stripe-signature` header
 * against STRIPE_WEBHOOK_SECRET, not a user-auth route. Handles
 * subscription checkout/cancellation events and syncs profiles.plan.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email ?? session.customer_details?.email

    if (email) {
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('email', email)
        .select('full_name')
        .single()

      if (error) {
        console.error('Failed to update profile plan:', error.message)
      } else {
        const { origin } = new URL(request.url)
        try {
          await sendUpgradeConfirmationEmail(email, updatedProfile?.full_name ?? '', origin)
        } catch (err) {
          console.error('Failed to send upgrade confirmation email:', err)
        }
      }
    }
  }

  // Fires once a canceled subscription actually ends — whether the user
  // canceled immediately or at period end via the billing portal, this is
  // the moment access should stop, matching what the pricing FAQ and help
  // center promise ("you'll keep access until the end of your billing
  // period"). We don't persist a stripe_customer_id, so look the email up
  // from the Stripe customer instead, same as the checkout flow.
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

    try {
      const customer = await stripe.customers.retrieve(customerId)
      const email = !customer.deleted ? customer.email : null

      if (email) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ plan: 'free' })
          .eq('email', email)

        if (error) {
          console.error('Failed to downgrade profile plan after subscription cancellation:', error.message)
        }
      } else {
        console.error('customer.subscription.deleted: no email on Stripe customer', customerId)
      }
    } catch (err) {
      console.error('Failed to look up Stripe customer for subscription cancellation:', err)
    }
  }

  return NextResponse.json({ received: true })
}

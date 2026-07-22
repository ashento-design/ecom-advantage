import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendUpgradeConfirmationEmail } from '@/app/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email ?? session.customer_details?.email

    if (email) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
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

  return NextResponse.json({ received: true })
}

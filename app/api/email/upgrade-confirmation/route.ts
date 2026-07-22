import { NextRequest, NextResponse } from 'next/server'
import { sendUpgradeConfirmationEmail } from '@/app/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = body?.email
  const name = body?.name ?? ''

  if (!email) {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const { origin } = new URL(request.url)

  try {
    await sendUpgradeConfirmationEmail(email, name, origin)
  } catch (err) {
    console.error('Failed to send upgrade confirmation email:', err)
    return NextResponse.json({ error: 'email_send_failed' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}

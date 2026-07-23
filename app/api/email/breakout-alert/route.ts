import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { maybeSendBreakoutAlert } from '@/app/lib/digest'

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let productId: string
  try {
    const body = await request.json()
    productId = body.product_id
    if (!productId) throw new Error('missing product_id')
  } catch {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  try {
    const { origin } = new URL(request.url)
    const result = await maybeSendBreakoutAlert(productId, origin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[breakout-alert] Failed to send alert:', err)
    return NextResponse.json({ error: 'alert_send_failed' }, { status: 500 })
  }
}

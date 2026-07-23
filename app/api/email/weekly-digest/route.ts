import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { sendWeeklyDigest } from '@/app/lib/digest'

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const { origin } = new URL(request.url)
    const result = await sendWeeklyDigest(origin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[weekly-digest] Failed to send digest:', err)
    return NextResponse.json({ error: 'digest_send_failed' }, { status: 500 })
  }
}

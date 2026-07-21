import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ isAdmin: false }, { status: 403 })
  }
  return NextResponse.json({ isAdmin: true })
}

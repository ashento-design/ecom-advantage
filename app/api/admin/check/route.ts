import { NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'

/**
 * GET /api/admin/check
 * Auth required (must match ADMIN_EMAIL). Used by the navbar/admin guard to
 * check whether the current user should see admin-only UI.
 * Response: { isAdmin: boolean }.
 */
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ isAdmin: false }, { status: 403 })
  }
  return NextResponse.json({ isAdmin: true })
}

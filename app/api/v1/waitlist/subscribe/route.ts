import { NextRequest } from 'next/server'
import { POST as subscribeHandler } from '@/app/api/waitlist/subscribe/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * POST /api/v1/waitlist/subscribe
 * Mirrors /api/waitlist/subscribe. Public — no auth required.
 * Body: { email, name?, source?, ref? }.
 * Response: { success, data: { success, position?, alreadySubscribed? } }.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await subscribeHandler(request))
}

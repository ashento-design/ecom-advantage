import { GET as countHandler } from '@/app/api/waitlist/count/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * GET /api/v1/waitlist/count
 * Mirrors /api/waitlist/count. Public — no auth required.
 * Response: { success, data: { count } }.
 */
export async function GET() {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await countHandler())
}

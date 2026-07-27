import { GET as productsHandler } from '@/app/api/products/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * GET /api/v1/products
 * Mirrors /api/products — the full product feed, sorted by demand score.
 * Public — no auth required. Response: { success, data: Product[] }.
 */
export async function GET() {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await productsHandler())
}

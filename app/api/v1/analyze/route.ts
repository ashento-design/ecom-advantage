import { NextRequest } from 'next/server'
import { POST as analyzeHandler } from '@/app/api/analyze/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * POST /api/v1/analyze
 * Mirrors /api/analyze — runs AI demand/competition analysis on a product.
 * Auth required. Body: { product_id?, title, description, niche }.
 * Free plan is limited to 3 analyses total (enforced by the mirrored
 * handler); this route additionally applies the v1 hourly rate limit.
 * Response: { success, data: AnalysisResult }.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await analyzeHandler(request))
}

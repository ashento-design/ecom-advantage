import { NextRequest } from 'next/server'
import { GET as storeIntelGetHandler, POST as storeIntelPostHandler } from '@/app/api/store-intelligence/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * GET /api/v1/store-intelligence
 * Mirrors /api/store-intelligence — lists the caller's last 5 saved
 * analyses. Auth required, Pro plan required.
 * Response: { success, data: StoreAnalysisRecord[] }.
 */
export async function GET() {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await storeIntelGetHandler())
}

/**
 * POST /api/v1/store-intelligence
 * Mirrors /api/store-intelligence — scrapes and AI-analyzes a Shopify
 * store. Auth required, Pro plan required. Body: { storeUrl }.
 * Response: { success, data: StoreAnalysis }.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await storeIntelPostHandler(request))
}

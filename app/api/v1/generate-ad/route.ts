import { NextRequest } from 'next/server'
import { POST as generateAdHandler } from '@/app/api/generate-ad/route'
import { enforceApiRateLimit, normalizeV1Response } from '@/app/lib/apiV1'

/**
 * POST /api/v1/generate-ad
 * Mirrors /api/generate-ad — generates an AI ad creative for a product.
 * Auth required. Body: { product_id, title, description, ad_angle,
 * format: 'square'|'vertical'|'horizontal', style: 'clean'|'lifestyle'|
 * 'bold'|'minimalist', referenceImageUrl? }.
 * Response: { success, data: { id, image_url, ad_angle, format, style,
 * persisted } }.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceApiRateLimit()
  if (limited) return limited
  return normalizeV1Response(await generateAdHandler(request))
}

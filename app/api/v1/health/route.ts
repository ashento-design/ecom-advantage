import { NextResponse } from 'next/server'

/**
 * GET /api/v1/health
 * Public — no auth required. Returns basic service status for uptime
 * checks and as a connectivity probe for the future mobile app.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      version: 'v1',
      timestamp: new Date().toISOString(),
    },
  })
}

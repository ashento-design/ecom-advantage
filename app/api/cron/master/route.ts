import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/app/lib/adminAuth'
import { runMasterCron } from '@/app/lib/masterCron'

/**
 * GET /api/cron/master
 * The only scheduled cron route (see vercel.json) — Vercel calls this once
 * daily and sends `Authorization: Bearer $CRON_SECRET` automatically.
 * Runs onboarding drip + daily digest + weekly digest (Mondays) in one pass
 * with shared per-user and global rate limits. Accepts ?dry_run=true for
 * manual verification via curl without sending anything.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true'
  const { origin } = new URL(request.url)

  try {
    const result = await runMasterCron({ origin, dryRun })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron/master] Run failed:', err)
    return NextResponse.json({ error: 'master_cron_failed' }, { status: 500 })
  }
}

/**
 * POST /api/cron/master
 * Admin-session auth (not the cron secret) — lets the admin panel trigger
 * the exact same run manually, normally with ?dry_run=true to preview what
 * the next scheduled run would do without sending anything.
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true'
  const { origin } = new URL(request.url)

  try {
    const result = await runMasterCron({ origin, dryRun })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron/master] Manual run failed:', err)
    return NextResponse.json({ error: 'master_cron_failed' }, { status: 500 })
  }
}

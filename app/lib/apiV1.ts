import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'

// --- Rate limiting -----------------------------------------------------
//
// In-memory only: resets on redeploy/restart and does NOT share state
// across multiple serverless instances. This is a foundation for the
// future mobile API, not a production-grade distributed limiter (that
// would need something like Upstash/Redis) — good enough to stop a single
// runaway client from hammering one instance.

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const FREE_LIMIT = 100
const PRO_LIMIT = 1000

type Bucket = { count: number; windowStart: number }
const buckets = new Map<string, Bucket>()

export type RateLimitResult = { allowed: boolean; limit: number; remaining: number; resetAt: number }

export function checkRateLimit(key: string, plan: 'free' | 'pro'): RateLimitResult {
  const limit = plan === 'pro' ? PRO_LIMIT : FREE_LIMIT
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return { allowed: true, limit, remaining: limit - 1, resetAt: now + WINDOW_MS }
  }
  if (existing.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetAt: existing.windowStart + WINDOW_MS }
  }
  existing.count += 1
  return { allowed: true, limit, remaining: limit - existing.count, resetAt: existing.windowStart + WINDOW_MS }
}

// Applies the per-user hourly limit for /api/v1/* routes. Returns a 429
// NextResponse if the caller is over their limit, or null to let the
// request proceed. Unauthenticated callers are left to the wrapped
// handler's own auth check (usually a 401) — there's no per-user bucket
// to rate-limit against until someone's actually signed in.
export async function enforceApiRateLimit(): Promise<NextResponse | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan === 'pro' ? 'pro' : 'free'

  const result = checkRateLimit(user.id, plan)
  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'rate_limit_exceeded',
          message: `Rate limit exceeded (${result.limit}/hour). Try again after ${new Date(result.resetAt).toISOString()}.`,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    )
  }
  return null
}

// --- Response normalization --------------------------------------------
//
// The legacy (pre-v1) routes each return their own ad-hoc JSON shape
// (a raw array, `{ error }`, `{ success, position }`, etc.) since they
// predate any API versioning. v1 routes delegate to those same handlers
// (no duplicated business logic) and run the result through this to
// guarantee every v1 response is `{ success, data }` or
// `{ success: false, error: { code, message } }`, regardless of what the
// underlying handler returned.
export async function normalizeV1Response(response: Response): Promise<NextResponse> {
  const body = await response.json().catch(() => null)

  if (response.ok) {
    return NextResponse.json({ success: true, data: body }, { status: response.status })
  }

  const code = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : 'unknown_error'
  return NextResponse.json(
    { success: false, error: { code, message: code } },
    { status: response.status }
  )
}

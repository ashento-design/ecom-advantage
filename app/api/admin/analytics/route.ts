import { NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

const DAYS = 30

function dayKey(iso: string) {
  return iso.slice(0, 10) // YYYY-MM-DD
}

function last30Days() {
  const days: string[] = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - (DAYS - 1))
  since.setUTCHours(0, 0, 0, 0)

  const [{ data: profiles, error: profilesError }, { data: analyses, error: analysesError }] = await Promise.all([
    supabaseAdmin.from('profiles').select('created_at').gte('created_at', since.toISOString()),
    supabaseAdmin.from('ai_analyses').select('created_at, product_id').gte('created_at', since.toISOString()),
  ])

  if (profilesError || analysesError) {
    return NextResponse.json({ error: (profilesError ?? analysesError)?.message }, { status: 500 })
  }

  const days = last30Days()

  const signupsByDay: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]))
  for (const p of profiles ?? []) {
    const key = dayKey(p.created_at)
    if (key in signupsByDay) signupsByDay[key] += 1
  }

  const analysesByDay: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]))
  const analysesByProduct: Record<string, number> = {}
  for (const a of analyses ?? []) {
    const key = dayKey(a.created_at)
    if (key in analysesByDay) analysesByDay[key] += 1
    if (a.product_id) analysesByProduct[a.product_id] = (analysesByProduct[a.product_id] ?? 0) + 1
  }

  const topProductIds = Object.entries(analysesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id)

  let topProducts: { id: string; title: string; count: number }[] = []
  if (topProductIds.length > 0) {
    const { data: productRows } = await supabaseAdmin
      .from('products')
      .select('id, title')
      .in('id', topProductIds)
    const titleById = Object.fromEntries((productRows ?? []).map((p) => [p.id, p.title]))
    topProducts = topProductIds.map((id) => ({
      id,
      title: titleById[id] ?? 'Unknown product',
      count: analysesByProduct[id],
    }))
  }

  return NextResponse.json({
    days,
    signups: days.map((d) => signupsByDay[d]),
    analyses: days.map((d) => analysesByDay[d]),
    topProducts,
  })
}

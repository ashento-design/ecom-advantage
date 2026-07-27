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

  const weekAgo = new Date()
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 6)
  weekAgo.setUTCHours(0, 0, 0, 0)

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

  // Best-effort additions — analytics_events may not exist yet if that
  // migration hasn't been run, so these degrade to 0/empty rather than
  // failing the whole dashboard (supabase-js returns a PostgREST error
  // object here instead of throwing, so `?? 0` already covers a missing
  // table; the try/catch is a safety net for actual network failures).
  let pageViewsThisWeek = 0
  let signupsThisWeek = 0
  const adFormatCounts: Record<string, number> = {}
  const adStyleCounts: Record<string, number> = {}

  try {
    const { count } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'page_view')
      .gte('created_at', weekAgo.toISOString())
    pageViewsThisWeek = count ?? 0
  } catch (err) {
    console.error('[admin/analytics] Failed to load page views (analytics_events may not exist yet):', err)
  }

  try {
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())
    signupsThisWeek = count ?? 0
  } catch (err) {
    console.error('[admin/analytics] Failed to load weekly signups:', err)
  }

  try {
    const { data: ads } = await supabaseAdmin
      .from('generated_ads')
      .select('format, style')
      .gte('created_at', since.toISOString())
    for (const ad of ads ?? []) {
      if (ad.format) adFormatCounts[ad.format] = (adFormatCounts[ad.format] ?? 0) + 1
      if (ad.style) adStyleCounts[ad.style] = (adStyleCounts[ad.style] ?? 0) + 1
    }
  } catch (err) {
    console.error('[admin/analytics] Failed to load ad format/style breakdown:', err)
  }

  // null (not 0) when there's no page-view data yet, so the UI can show
  // "not enough data" instead of a misleading "0%".
  const conversionRatePct = pageViewsThisWeek > 0
    ? Math.round((signupsThisWeek / pageViewsThisWeek) * 1000) / 10
    : null

  return NextResponse.json({
    days,
    signups: days.map((d) => signupsByDay[d]),
    analyses: days.map((d) => analysesByDay[d]),
    topProducts,
    pageViewsThisWeek,
    signupsThisWeek,
    conversionRatePct,
    adFormats: Object.entries(adFormatCounts).map(([format, count]) => ({ format, count })),
    adStyles: Object.entries(adStyleCounts).map(([style, count]) => ({ style, count })),
  })
}

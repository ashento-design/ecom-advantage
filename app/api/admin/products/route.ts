import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

export async function POST(request: NextRequest) {
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

  const body = await request.json()
  const { title, description, image_url, niche, supplier_url, demand_score, trend_label, is_featured } = body

  if (!title || !niche) {
    return NextResponse.json({ error: 'title and niche are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      title,
      description,
      image_url,
      niche,
      supplier_url,
      demand_score,
      trend_label,
      is_featured: is_featured ?? false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

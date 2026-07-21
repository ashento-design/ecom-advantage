import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params
  const body = await request.json()
  const { title, description, image_url, niche, supplier_url, demand_score, trend_label, is_featured } = body

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ title, description, image_url, niche, supplier_url, demand_score, trend_label, is_featured })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

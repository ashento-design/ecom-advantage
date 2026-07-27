import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

const ALLOWED_FIELDS = ['name', 'role', 'company', 'content', 'rating', 'avatar_initials', 'is_featured'] as const

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
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update(updates)
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
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

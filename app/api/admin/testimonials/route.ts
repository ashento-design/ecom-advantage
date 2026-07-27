import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, getSupabaseAdmin } from '@/app/lib/adminAuth'

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

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

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

  const body = await request.json().catch(() => null)
  const { name, role, company, content, rating, avatar_initials, is_featured } = body ?? {}

  if (!name || !content || !avatar_initials) {
    return NextResponse.json({ error: 'name, content, and avatar_initials are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({
      name,
      role: role || null,
      company: company || null,
      content,
      rating: typeof rating === 'number' ? rating : 5,
      avatar_initials,
      is_featured: is_featured ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

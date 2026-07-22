import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const BUCKET = 'product-images'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || (!body.imageBase64 && !body.imageUrl)) {
    return NextResponse.json({ error: 'invalid_request_body' }, { status: 400 })
  }

  let buffer: Buffer
  let contentType = 'image/png'

  try {
    if (body.imageBase64) {
      const match = /^data:(.+);base64,(.+)$/.exec(body.imageBase64)
      if (match) {
        contentType = match[1]
        buffer = Buffer.from(match[2], 'base64')
      } else {
        buffer = Buffer.from(body.imageBase64, 'base64')
      }
    } else {
      const res = await fetch(body.imageUrl)
      if (!res.ok) throw new Error(`Failed to fetch image URL: ${res.status}`)
      contentType = res.headers.get('content-type') ?? 'image/png'
      buffer = Buffer.from(await res.arrayBuffer())
    }
  } catch (err) {
    console.error('Failed to read image data:', err)
    return NextResponse.json({ error: 'invalid_image' }, { status: 400 })
  }

  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'image_too_large' }, { status: 413 })
  }

  const ext = contentType.split('/')[1]?.split('+')[0] ?? 'png'
  const folder = body.folder === 'ads' ? 'ads' : 'products'
  const path = `${folder}/${user.id}/${randomUUID()}.${ext}`

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false })

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrlData.publicUrl })
}

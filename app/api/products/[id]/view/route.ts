import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { maybeSendBreakoutAlert } from '@/app/lib/digest'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let supabaseAdmin
  try {
    supabaseAdmin = getServiceRoleClient()
  } catch {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('views')
    .eq('id', id)
    .single()

  if (fetchError || !product) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({ views: (product.views ?? 0) + 1 })
    .eq('id', id)

  if (updateError) {
    console.error('Failed to increment product views:', updateError.message)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Fire-and-forget — a breakout alert failure should never block the view
  // increment from returning to the client.
  const { origin } = new URL(request.url)
  maybeSendBreakoutAlert(id, origin).catch((err) => {
    console.error('[products/view] maybeSendBreakoutAlert failed:', err)
  })

  return NextResponse.json({ success: true })
}

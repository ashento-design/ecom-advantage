import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/app/lib/supabase'

export async function getAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return null

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== adminEmail) return null
  return user
}

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
}

import { createServerClient } from '@/app/lib/supabase'

export { getServiceRoleClient as getSupabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function getAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return null

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== adminEmail) return null
  return user
}

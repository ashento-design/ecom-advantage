import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { sendWeeklyDigestEmail, sendBreakoutAlertEmail } from '@/app/lib/email'

const TOP_PRODUCTS_COUNT = 5
const BREAKOUT_VIEWS_THRESHOLD = 50

export async function sendWeeklyDigest(dashboardUrl: string) {
  const supabaseAdmin = getServiceRoleClient()

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, title, image_url, demand_score')
    .order('demand_score', { ascending: false })
    .limit(TOP_PRODUCTS_COUNT)

  if (productsError) throw productsError
  if (!products || products.length === 0) {
    return { sent: 0, skipped: 0, failed: 0 }
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, email_preferences')

  if (profilesError) throw profilesError

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const profile of profiles ?? []) {
    const wantsDigest = profile.email_preferences?.weekly_digest ?? true
    if (!wantsDigest || !profile.email) {
      skipped += 1
      continue
    }
    try {
      await sendWeeklyDigestEmail(profile.email, profile.full_name ?? '', products, dashboardUrl)
      sent += 1
    } catch (err) {
      console.error(`[weekly-digest] Failed to send to ${profile.email}:`, err)
      failed += 1
    }
  }

  return { sent, skipped, failed }
}

// Best-effort: called after a product's view count is incremented. Fires a
// breakout alert to Pro users (with the preference enabled) the first time a
// product's cumulative view count crosses the threshold — this is a proxy
// for "high views in a short time" since the schema only tracks a lifetime
// views counter, not per-view timestamps. breakout_alert_sent guards against
// re-sending on every subsequent view once the threshold has been crossed.
export async function maybeSendBreakoutAlert(productId: string, dashboardUrl: string) {
  const supabaseAdmin = getServiceRoleClient()

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, title, image_url, views, breakout_alert_sent')
    .eq('id', productId)
    .single()

  if (productError || !product) return { sent: 0 }
  if (product.breakout_alert_sent || (product.views ?? 0) < BREAKOUT_VIEWS_THRESHOLD) {
    return { sent: 0 }
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, email_preferences')
    .eq('plan', 'pro')

  if (profilesError) throw profilesError

  let sent = 0
  for (const profile of profiles ?? []) {
    const wantsAlerts = profile.email_preferences?.breakout_alerts ?? false
    if (!wantsAlerts || !profile.email) continue
    try {
      await sendBreakoutAlertEmail(profile.email, profile.full_name ?? '', product, dashboardUrl)
      sent += 1
    } catch (err) {
      console.error(`[breakout-alert] Failed to send to ${profile.email}:`, err)
    }
  }

  await supabaseAdmin.from('products').update({ breakout_alert_sent: true }).eq('id', productId)

  return { sent }
}

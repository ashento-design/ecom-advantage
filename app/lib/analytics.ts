import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'

export type AnalyticsEventType = 'page_view' | 'product_analyzed' | 'ad_generated' | 'store_analyzed' | 'upgrade_clicked' | 'video_script_generated'

// Best-effort, fire-and-forget-safe: never throws, so a tracking failure
// never breaks the feature it's attached to.
export async function trackEvent(
  eventType: AnalyticsEventType,
  options: { userId?: string | null; metadata?: Record<string, unknown> } = {}
) {
  try {
    const supabaseAdmin = getServiceRoleClient()
    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_type: eventType,
      user_id: options.userId ?? null,
      metadata: options.metadata ?? null,
    })
    if (error) throw error
  } catch (err) {
    console.error(`[analytics] Failed to track event "${eventType}":`, err)
  }
}

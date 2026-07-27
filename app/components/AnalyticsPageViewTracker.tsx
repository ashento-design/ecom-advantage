'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Fires a first-party page_view event on every route change. Separate from
// Vercel Analytics (installed for its own dashboard) — this feeds the
// "page views this week" / conversion numbers on /admin/analytics, which
// Vercel's own analytics data isn't queryable from within the app for.
export function AnalyticsPageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}

'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    ttq?: ((...args: unknown[]) => void) & {
      track: (...args: unknown[]) => void
      page: (...args: unknown[]) => void
    }
  }
}

// Fires a TikTok Pixel event if the pixel is configured — safe to call from
// anywhere even if <TikTokPixel> hasn't mounted yet or
// NEXT_PUBLIC_TIKTOK_PIXEL_ID isn't set, since it just no-ops.
export function trackTikTokEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.ttq) return
  window.ttq.track(event, params)
}

// Loads the TikTok Pixel base code and fires a page event on every route
// change. Renders nothing if NEXT_PUBLIC_TIKTOK_PIXEL_ID isn't set, so it's
// safe to always mount in the root layout.
export function TikTokPixel() {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!pixelId) return
    // The init script below already fires the first page event itself —
    // this effect only needs to cover subsequent client-side navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (window.ttq) window.ttq.page()
  }, [pixelId, pathname])

  if (!pixelId) return null

  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<e.methods.length;n++)ttq.setAndDefer(e,e.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

          ttq.load('${pixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `}
    </Script>
  )
}

'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] }
  }
}

// Fires a Meta Pixel event if the pixel is configured — safe to call from
// anywhere (signup, checkout, purchase redirect) even if <MetaPixel> hasn't
// mounted yet or NEXT_PUBLIC_META_PIXEL_ID isn't set, since it just no-ops.
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, params)
}

// Loads the Meta (Facebook) Pixel base code and fires PageView on every
// route change. Renders nothing if NEXT_PUBLIC_META_PIXEL_ID isn't set, so
// it's safe to always mount in the root layout.
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!pixelId) return
    // The init script below already fires the first PageView itself —
    // this effect only needs to cover subsequent client-side navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trackMetaEvent('PageView')
  }, [pixelId, pathname])

  if (!pixelId) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

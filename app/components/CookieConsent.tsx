'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'launchory_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      Promise.resolve().then(() => setVisible(true))
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-4 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-gray-300 text-xs sm:text-sm flex-1 text-center sm:text-left leading-relaxed">
          We use cookies to keep you signed in and understand how Launchory is used. By continuing, you agree to our{' '}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</Link>.
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 w-full sm:w-auto min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

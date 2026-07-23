'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-black/30 flex items-center justify-center transition-colors"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgressBar() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const growTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      const isInternal = href && href.startsWith('/') && !href.startsWith('//')
      if (!isInternal || link.target === '_blank') return

      setVisible(true)
      setProgress(15)
      if (growTimer.current) clearInterval(growTimer.current)
      growTimer.current = setInterval(() => {
        setProgress((p) => (p < 88 ? p + (90 - p) * 0.15 : p))
      }, 150)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const prevPathname = useRef(pathname)
  useEffect(() => {
    // Pathname changed — the new route has committed, so finish the bar.
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname
    if (growTimer.current) clearInterval(growTimer.current)

    let hideTimer: ReturnType<typeof setTimeout>
    Promise.resolve().then(() => {
      setProgress(100)
      hideTimer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 250)
    })
    return () => clearTimeout(hideTimer)
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-indigo-500 transition-[width] duration-200 ease-out shadow-[0_0_8px_rgba(99,102,241,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

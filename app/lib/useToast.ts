'use client'

import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToastMessage(message)
    timeoutRef.current = setTimeout(() => setToastMessage(null), 2500)
  }, [])

  return { toastMessage, showToast }
}

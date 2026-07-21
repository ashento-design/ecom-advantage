'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/app/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function useAdminGuard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [adminChecked, setAdminChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function verify() {
      const supabase = createBrowserClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/')
        return
      }

      const res = await fetch('/api/admin/check')
      if (!res.ok) {
        router.push('/')
        return
      }

      setUser(data.user)
      setAdminChecked(true)
    }
    verify()
  }, [router])

  return { user, adminChecked }
}

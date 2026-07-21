'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSavedProducts(user: User | null, onToast?: (message: string) => void) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    supabase
      .from('saved_products')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load saved products:', error.message)
          return
        }
        setSavedIds(new Set((data ?? []).map((row) => row.product_id as string)))
      })
  }, [user])

  const toggleSave = useCallback(
    async (productId: string) => {
      if (!user) return
      const supabase = createBrowserClient()
      const isSaved = savedIds.has(productId)

      if (isSaved) {
        const { error } = await supabase
          .from('saved_products')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
        if (error) {
          console.error('Failed to remove saved product:', error.message)
          return
        }
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        onToast?.('Removed from saved')
      } else {
        const { error } = await supabase
          .from('saved_products')
          .insert({ user_id: user.id, product_id: productId })
        if (error) {
          console.error('Failed to save product:', error.message)
          return
        }
        setSavedIds((prev) => new Set(prev).add(productId))
        onToast?.('Saved!')
      }
    },
    [user, savedIds, onToast]
  )

  return { savedIds, toggleSave }
}

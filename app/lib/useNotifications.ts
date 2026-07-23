'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase'
import type { User } from '@supabase/supabase-js'

export type NotificationType = 'new_product' | 'breakout' | 'referral_reward' | 'system'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
}

const RECENT_LIMIT = 10

export function useNotifications(user: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createBrowserClient()
    supabase
      .from('notifications')
      .select('id, type, title, message, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load notifications:', error.message)
        } else {
          setNotifications(data ?? [])
        }
        setLoading(false)
      })
  }, [user])

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    const supabase = createBrowserClient()
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (error) console.error('Failed to mark notification as read:', error.message)
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .in('id', unreadIds)
    if (error) console.error('Failed to mark all notifications as read:', error.message)
  }, [user, notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead }
}

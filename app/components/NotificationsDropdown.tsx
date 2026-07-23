'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Package, Flame, Gift, Info, CheckCheck } from 'lucide-react'
import { useNotifications, type NotificationType } from '@/app/lib/useNotifications'
import type { User } from '@supabase/supabase-js'

const typeConfig: Record<NotificationType, { icon: typeof Package; color: string }> = {
  new_product: { icon: Package, color: 'text-indigo-400 bg-indigo-600/15 border-indigo-500/30' },
  breakout: { icon: Flame, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  referral_reward: { icon: Gift, color: 'text-emerald-400 bg-emerald-600/15 border-emerald-500/30' },
  system: { icon: Info, color: 'text-gray-400 bg-gray-700/40 border-gray-600/40' },
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function NotificationsDropdown({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(user)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
        <Bell size={16} />
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-gray-950" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-white text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
              >
                <CheckCheck size={12} />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-800/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No notifications yet.</div>
            ) : (
              notifications.map((n) => {
                const config = typeConfig[n.type] ?? typeConfig.system
                const Icon = config.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-800/60 last:border-b-0 hover:bg-gray-800/40 transition-colors ${n.read ? '' : 'bg-indigo-500/[0.04]'}`}
                  >
                    <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${config.color}`}>
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">{n.title}</span>
                        {!n.read && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </span>
                      <span className="block text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</span>
                      <span className="block text-gray-600 text-[11px] mt-1">{timeAgo(n.created_at)}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

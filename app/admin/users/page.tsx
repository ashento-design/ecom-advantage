'use client'

import { useEffect, useState } from 'react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

type AdminUser = {
  id: string
  email: string
  full_name: string | null
  plan: string
  analyses_used: number
  ads_generated: number
  created_at: string
  last_active: string | null
}

export default function AdminUsersPage() {
  const { user, adminChecked } = useAdminGuard()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminChecked) return
    async function load() {
      const res = await fetch('/api/admin/users')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoadError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : 'Failed to load users.')
        setLoading(false)
        return
      }
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [adminChecked])

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-gray-400 text-sm mb-8">{users.length ? `${users.length} registered users` : 'Registered users'}</p>

      {loadError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        !loadError && <div className="text-center py-20 text-gray-500">No users yet.</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Analyses Used</th>
                  <th className="px-4 py-3 font-medium">Ads Generated</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/60 last:border-b-0 hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          u.plan === 'pro'
                            ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {u.plan === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.analyses_used}</td>
                    <td className="px-4 py-3 text-gray-300">{u.ads_generated ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.last_active ? new Date(u.last_active).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

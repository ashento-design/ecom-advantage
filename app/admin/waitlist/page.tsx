'use client'

import { useEffect, useState } from 'react'
import { Download, Mail, Users } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

type WaitlistSubscriber = {
  id: string
  email: string
  name: string | null
  source: string | null
  referral_code: string | null
  created_at: string
  notified: boolean
}

function downloadCsv(rows: WaitlistSubscriber[]) {
  const header = ['Email', 'Name', 'Source', 'Referral Code', 'Signup Date']
  const csvRows = [header.join(',')]
  for (const r of rows) {
    const fields = [r.email, r.name ?? '', r.source ?? '', r.referral_code ?? '', new Date(r.created_at).toISOString()]
    csvRows.push(fields.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
  }
  const csv = csvRows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `launchory-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function AdminWaitlistPage() {
  const { user, adminChecked } = useAdminGuard()
  const [subscribers, setSubscribers] = useState<WaitlistSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminChecked) return
    async function load() {
      setLoading(true)
      const res = await fetch('/api/admin/waitlist')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoadError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : 'Failed to load waitlist subscribers.')
        setLoading(false)
        return
      }
      setSubscribers(data)
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
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Waitlist</h1>
          <p className="text-gray-400 text-sm">Fall 2026 launch waitlist signups.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCsv(subscribers)}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
          >
            <Download size={15} />
            Export to CSV
          </button>
          <button
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-2 bg-emerald-600/50 cursor-not-allowed text-white/70 text-sm font-medium px-4 py-2.5 rounded-xl border border-emerald-500/30"
          >
            <Mail size={15} />
            Send Launch Email
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8 w-fit">
        <div className="w-10 h-10 bg-indigo-600/15 border border-indigo-500/30 rounded-lg flex items-center justify-center">
          <Users size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-white font-bold text-2xl leading-none">{subscribers.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total subscribers</p>
        </div>
      </div>

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
      ) : subscribers.length === 0 ? (
        !loadError && <div className="text-center py-20 text-gray-500">No waitlist signups yet.</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800/60 last:border-b-0">
                    <td className="px-4 py-3 text-white font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-gray-400">{s.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{s.source ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
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

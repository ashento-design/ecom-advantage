'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ExternalLink } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

type ProductRequest = {
  id: string
  product_name: string
  product_url: string | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  email: string | null
}

const statusStyles: Record<string, string> = {
  pending: 'bg-gray-800 text-gray-400 border-gray-700',
  approved: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-600/15 text-red-400 border-red-500/30',
}

export default function AdminRequestsPage() {
  const { user, adminChecked } = useAdminGuard()
  const [requests, setRequests] = useState<ProductRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!adminChecked) return
    async function load() {
      setLoading(true)
      const res = await fetch('/api/admin/requests')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoadError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : 'Failed to load requests.')
        setLoading(false)
        return
      }
      setRequests(data)
      setLoading(false)
    }
    load()
  }, [adminChecked])

  async function handleReject(id: string) {
    setActioningId(id)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
      }
    } finally {
      setActioningId(null)
    }
  }

  async function handleApprove(req: ProductRequest) {
    setActioningId(req.id)
    try {
      const res = await fetch(`/api/admin/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        router.push(`/admin/products/new?title=${encodeURIComponent(req.product_name)}`)
      }
    } finally {
      setActioningId(null)
    }
  }

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const reviewed = requests.filter((r) => r.status !== 'pending')

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Product Requests</h1>
      <p className="text-gray-400 text-sm mb-8">
        {pending.length ? `${pending.length} pending request${pending.length === 1 ? '' : 's'}` : 'User-submitted product suggestions'}
      </p>

      {loadError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        !loadError && <div className="text-center py-20 text-gray-500">No product requests yet.</div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-semibold">{req.product_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-2">
                        {req.email ?? 'Unknown user'} · {new Date(req.created_at).toLocaleDateString()}
                      </p>
                      {req.reason && <p className="text-gray-300 text-sm mb-2">{req.reason}</p>}
                      {req.product_url && (
                        <a
                          href={req.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        >
                          <ExternalLink size={12} />
                          View link
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={actioningId === req.id}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                      >
                        <Check size={13} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actioningId === req.id}
                        className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-red-900/40 disabled:opacity-50 text-gray-300 hover:text-red-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-gray-700 hover:border-red-500/40"
                      >
                        <X size={13} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewed.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Reviewed</p>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Requested by</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewed.map((req) => (
                        <tr key={req.id} className="border-b border-gray-800/60 last:border-b-0">
                          <td className="px-4 py-3 text-white font-medium">{req.product_name}</td>
                          <td className="px-4 py-3 text-gray-400">{req.email ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[req.status]}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

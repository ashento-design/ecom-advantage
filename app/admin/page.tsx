'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Users, Zap, Plus, List, DollarSign, Crown, Image as ImageIcon } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

type Stats = {
  totalProducts: number
  totalUsers: number
  totalAnalyses: number
  totalProUsers: number
  estimatedMRR: number
  totalAdsGenerated: number
}

export default function AdminDashboardPage() {
  const { user, adminChecked } = useAdminGuard()
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!adminChecked) return
    async function loadStats() {
      const res = await fetch('/api/admin/stats')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setStatsError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : 'Failed to load stats.')
        setLoading(false)
        return
      }
      setStats(data)
      setLoading(false)
    }
    loadStats()
  }, [adminChecked])

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts, icon: Package },
    { label: 'Total Users', value: stats?.totalUsers, icon: Users },
    { label: 'Analyses Run', value: stats?.totalAnalyses, icon: Zap },
  ]

  const revenueCards = [
    { label: 'Pro Users', value: stats?.totalProUsers, icon: Crown, format: (v: number) => v },
    { label: 'Estimated MRR', value: stats?.estimatedMRR, icon: DollarSign, format: (v: number) => `$${v.toLocaleString()}` },
    { label: 'Ads Generated', value: stats?.totalAdsGenerated, icon: ImageIcon, format: (v: number) => v },
  ]

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Overview of Launchory&apos;s product catalog and users.</p>

      {statsError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {statsError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className="text-emerald-400" />
              <span className="text-gray-500 text-xs font-medium">{card.label}</span>
            </div>
            <span className="text-white text-3xl font-bold">
              {loading ? '—' : (card.value ?? 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {revenueCards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-indigo-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className="text-indigo-400" />
              <span className="text-gray-500 text-xs font-medium">{card.label}</span>
            </div>
            <span className="text-white text-3xl font-bold">
              {loading ? '—' : card.format(card.value ?? 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-emerald-600/50 rounded-xl p-5 transition-colors"
        >
          <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Add Product</h3>
            <p className="text-gray-500 text-xs mt-0.5">Create a new product listing</p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-emerald-600/50 rounded-xl p-5 transition-colors"
        >
          <div className="w-11 h-11 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center shrink-0">
            <List size={20} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Manage Products</h3>
            <p className="text-gray-500 text-xs mt-0.5">Edit or remove existing products</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  )
}

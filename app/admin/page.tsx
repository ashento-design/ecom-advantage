'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Users, Zap, Plus, List, DollarSign, Crown, Image as ImageIcon, Mail, Sunrise, CalendarDays, UserPlus, Send, FlaskConical } from 'lucide-react'
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

const CRON_JOBS = [
  { key: 'daily-digest', label: 'Daily Digest', description: "Top 3 products to today's opted-in users", icon: Sunrise, endpoint: '/api/email/daily-digest' },
  { key: 'weekly-digest', label: 'Weekly Digest', description: 'Top 5 products to all opted-in users', icon: CalendarDays, endpoint: '/api/email/weekly-digest' },
  { key: 'onboarding-emails', label: 'Onboarding Emails', description: 'Day 2/4/6/8 emails for users due today', icon: UserPlus, endpoint: '/api/email/onboarding-emails' },
] as const

export default function AdminDashboardPage() {
  const { user, adminChecked } = useAdminGuard()
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [cronResults, setCronResults] = useState<Record<string, string>>({})
  const [masterRunning, setMasterRunning] = useState(false)
  const [masterResult, setMasterResult] = useState<Record<string, unknown> | null>(null)
  const [masterError, setMasterError] = useState<string | null>(null)

  async function handleTriggerCron(key: string, endpoint: string) {
    setTriggering(key)
    setCronResults((prev) => ({ ...prev, [key]: '' }))
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json().catch(() => null)
      setCronResults((prev) => ({
        ...prev,
        [key]: res.ok ? `Sent ${JSON.stringify(data)}` : `Error: ${data?.error ?? res.statusText}`,
      }))
    } catch {
      setCronResults((prev) => ({ ...prev, [key]: 'Network error' }))
    } finally {
      setTriggering(null)
    }
  }

  async function handleDryRunMasterCron() {
    setMasterRunning(true)
    setMasterError(null)
    setMasterResult(null)
    try {
      const res = await fetch('/api/cron/master?dry_run=true', { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setMasterError(data?.error ?? res.statusText)
        return
      }
      setMasterResult(data)
    } catch {
      setMasterError('Network error')
    } finally {
      setMasterRunning(false)
    }
  }

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

      <div className="mt-8 bg-gray-900 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Master Cron — Dry Run</h2>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Runs the exact same logic as the scheduled 8am UTC cron (onboarding drip, then daily digest, then weekly digest on Mondays) but sends nothing — use this to verify what the next real run would do.
        </p>
        <button
          onClick={handleDryRunMasterCron}
          disabled={masterRunning}
          className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          {masterRunning ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FlaskConical size={12} />
          )}
          {masterRunning ? 'Running dry run…' : 'Preview Next Run (Dry Run)'}
        </button>

        {masterError && (
          <p className="text-red-400 text-xs mt-3">Error: {masterError}</p>
        )}

        {masterResult && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-500 text-[11px] mb-1">Would send: onboarding</p>
              <p className="text-white text-lg font-bold">{String(masterResult.onboarding_sent)}</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-500 text-[11px] mb-1">Would send: daily</p>
              <p className="text-white text-lg font-bold">{String(masterResult.daily_sent)}</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-500 text-[11px] mb-1">Would send: weekly</p>
              <p className="text-white text-lg font-bold">{String(masterResult.weekly_sent)}</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-500 text-[11px] mb-1">Errors</p>
              <p className="text-white text-lg font-bold">{Array.isArray(masterResult.errors) ? masterResult.errors.length : 0}</p>
            </div>
            <details className="col-span-2 sm:col-span-4 bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <summary className="text-gray-400 text-xs font-medium cursor-pointer">Full dry-run response (would_send / would_skip)</summary>
              <pre className="text-gray-500 text-[11px] mt-2 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(masterResult, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail size={16} className="text-emerald-400" />
          <h2 className="text-white font-semibold text-sm">Trigger Individual Email Type (Manual, Real Send)</h2>
        </div>
        <p className="text-gray-500 text-xs mb-5">
          Sends real emails immediately for one type only — useful for testing a single template without waiting for the schedule. Not run automatically (only /api/cron/master is scheduled).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CRON_JOBS.map((job) => (
            <div key={job.key} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <job.icon size={14} className="text-gray-400" />
                <span className="text-white text-sm font-medium">{job.label}</span>
              </div>
              <p className="text-gray-500 text-xs mb-3">{job.description}</p>
              <button
                onClick={() => handleTriggerCron(job.key, job.endpoint)}
                disabled={triggering === job.key}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-950 disabled:opacity-50 border border-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                {triggering === job.key ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                {triggering === job.key ? 'Sending…' : 'Send now'}
              </button>
              {cronResults[job.key] && (
                <p className="text-gray-500 text-[11px] mt-2 break-words">{cronResults[job.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

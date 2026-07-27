'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

type AnalyticsData = {
  days: string[]
  signups: number[]
  analyses: number[]
  topProducts: { id: string; title: string; count: number }[]
  pageViewsThisWeek: number
  signupsThisWeek: number
  conversionRatePct: number | null
  adFormats: { format: string; count: number }[]
  adStyles: { style: string; count: number }[]
}

const FORMAT_LABEL: Record<string, string> = { square: 'Square', vertical: 'Vertical', horizontal: 'Horizontal' }
const STYLE_LABEL: Record<string, string> = { clean: 'Clean Shot', lifestyle: 'Lifestyle', bold: 'Bold Text', minimalist: 'Minimalist' }

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function BreakdownBars({ rows, color }: { rows: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="space-y-3">
      {rows
        .sort((a, b) => b.count - a.count)
        .map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-300 font-medium">{row.label}</span>
              <span className="text-gray-500">{row.count}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max((row.count / max) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
    </div>
  )
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#6b7280', maxTicksLimit: 8 }, grid: { color: '#1f2937' } },
    y: { ticks: { color: '#6b7280', precision: 0 }, grid: { color: '#1f2937' }, beginAtZero: true },
  },
}

export default function AdminAnalyticsPage() {
  const { user, adminChecked } = useAdminGuard()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!adminChecked) return
    async function load() {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setLoadError(json?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : 'Failed to load analytics.')
        setLoading(false)
        return
      }
      setData(json)
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

  const labels = data?.days.map(formatDay) ?? []

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
      <p className="text-gray-400 text-sm mb-8">Signups, AI usage, and top products over the last 30 days.</p>

      {loadError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1.5">Page views (7d)</p>
              <p className="text-white text-2xl font-bold">{data.pageViewsThisWeek.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1.5">Signups (7d)</p>
              <p className="text-white text-2xl font-bold">{data.signupsThisWeek.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 col-span-2 sm:col-span-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1.5">Conversion rate (approx.)</p>
              <p className="text-white text-2xl font-bold">
                {data.conversionRatePct === null ? '—' : `${data.conversionRatePct}%`}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Signups (last 30 days)</h2>
            <div className="h-64">
              <Line
                data={{
                  labels,
                  datasets: [{
                    label: 'Signups',
                    data: data.signups,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">AI analyses run (last 30 days)</h2>
            <div className="h-64">
              <Line
                data={{
                  labels,
                  datasets: [{
                    label: 'Analyses',
                    data: data.analyses,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249,115,22,0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Most analyzed products (top 10)</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No analyses yet in the last 30 days.</p>
            ) : (
              <div className="h-72">
                <Bar
                  data={{
                    labels: data.topProducts.map((p) => p.title),
                    datasets: [{
                      label: 'Analyses',
                      data: data.topProducts.map((p) => p.count),
                      backgroundColor: '#10b981',
                      borderRadius: 4,
                    }],
                  }}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const,
                    scales: {
                      x: { ticks: { color: '#6b7280', precision: 0 }, grid: { color: '#1f2937' }, beginAtZero: true },
                      y: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Ad formats (last 30 days)</h2>
              {data.adFormats.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">No ads generated yet in the last 30 days.</p>
              ) : (
                <BreakdownBars
                  rows={data.adFormats.map((f) => ({ label: FORMAT_LABEL[f.format] ?? f.format, count: f.count }))}
                  color="bg-indigo-500"
                />
              )}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Ad styles (last 30 days)</h2>
              {data.adStyles.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">No ads generated yet in the last 30 days.</p>
              ) : (
                <BreakdownBars
                  rows={data.adStyles.map((s) => ({ label: STYLE_LABEL[s.style] ?? s.style, count: s.count }))}
                  color="bg-emerald-500"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}

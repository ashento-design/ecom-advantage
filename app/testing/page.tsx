'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, FlaskConical, Trophy, XCircle, PauseCircle, StickyNote, Trash2,
  Pencil, TrendingUp, TrendingDown, ExternalLink, Calculator, Lock,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useToast } from '@/app/lib/useToast'
import { AppLayout } from '@/app/components/AppLayout'
import { Toast } from '@/app/components/Toast'
import { ProfitCalculatorPanel } from '@/app/components/ProfitCalculatorPanel'
import {
  daysSince, updateProductTestStatus, updateProductTestNotes,
  updateProductTestMetrics, deleteProductTest, type ProductTest, type TestStatus,
} from '@/app/lib/productTests'
import type { Product } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type TestRow = ProductTest & { products: Product | null }
type PageTab = 'board' | 'calculator'

const COLUMNS: { status: TestStatus; label: string; icon: typeof FlaskConical; color: string; emptyCopy: string }[] = [
  { status: 'testing', label: 'Testing', icon: FlaskConical, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5', emptyCopy: "Nothing being tested yet — add a product to get started!" },
  { status: 'winner', label: 'Winner', icon: Trophy, color: 'text-green-400 border-green-500/30 bg-green-500/5', emptyCopy: 'No winners yet — keep testing!' },
  { status: 'loser', label: 'Loser', icon: XCircle, color: 'text-red-400 border-red-500/30 bg-red-500/5', emptyCopy: "No losers yet — that's a good thing." },
  { status: 'paused', label: 'Paused', icon: PauseCircle, color: 'text-gray-400 border-gray-700 bg-gray-800/40', emptyCopy: 'Nothing paused right now.' },
]

function TestCard({ test, onChanged, showToast }: { test: TestRow; onChanged: () => void; showToast: (m: string) => void }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(test.notes ?? '')
  const [editingMetrics, setEditingMetrics] = useState(false)
  const [storeUrl, setStoreUrl] = useState(test.store_url ?? '')
  const [dailySpend, setDailySpend] = useState(test.daily_spend?.toString() ?? '')
  const [revenue, setRevenue] = useState(test.revenue?.toString() ?? '')
  const [orders, setOrders] = useState(test.orders?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  const product = test.products
  if (!product) return null

  const days = daysSince(test.started_at)
  const hasMetrics = test.daily_spend != null && test.revenue != null
  const totalSpend = hasMetrics ? (test.daily_spend ?? 0) * Math.max(days, 1) : 0
  const profit = hasMetrics ? (test.revenue ?? 0) - totalSpend : null
  const roas = hasMetrics && totalSpend > 0 ? (test.revenue ?? 0) / totalSpend : null

  async function handleMove(status: TestStatus) {
    const { error } = await updateProductTestStatus(test.id, status)
    if (error) {
      console.error('Failed to move test:', error.message)
      return
    }
    onChanged()
  }

  async function handleSaveNotes() {
    setSaving(true)
    const { error } = await updateProductTestNotes(test.id, notes)
    setSaving(false)
    if (error) {
      console.error('Failed to save notes:', error.message)
      return
    }
    setEditingNotes(false)
    onChanged()
  }

  async function handleSaveMetrics() {
    setSaving(true)
    const { error } = await updateProductTestMetrics(test.id, {
      store_url: storeUrl || undefined,
      daily_spend: dailySpend ? Number(dailySpend) : null,
      revenue: revenue ? Number(revenue) : null,
      orders: orders ? Number(orders) : null,
    })
    setSaving(false)
    if (error) {
      console.error('Failed to save metrics:', error.message)
      return
    }
    setEditingMetrics(false)
    onChanged()
  }

  async function handleDelete() {
    const { error } = await deleteProductTest(test.id)
    if (error) {
      console.error('Failed to remove test:', error.message)
      return
    }
    showToast('Removed from Testing Board')
    onChanged()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
      <div className="flex gap-3 mb-2.5">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
          <Image src={product.image_url} alt={product.title} fill sizes="48px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${product.id}`} className="text-white text-sm font-semibold leading-snug hover:text-indigo-400 transition-colors line-clamp-2">
            {product.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-[11px]">Demand {product.demand_score}</span>
            <span className="text-gray-600">&middot;</span>
            <span className="text-gray-500 text-[11px]">{days} {days === 1 ? 'day' : 'days'} testing</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
          aria-label="Remove from board"
          title="Remove from board"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {hasMetrics && (
        <div className="grid grid-cols-2 gap-2 mb-2.5 p-2.5 bg-gray-800/60 rounded-lg">
          <div>
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Profit est.</span>
            <div className={`flex items-center gap-1 text-sm font-bold ${(profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(profit ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {(profit ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">ROAS</span>
            <div className="text-white text-sm font-bold">{roas != null ? `${roas.toFixed(2)}x` : '—'}</div>
          </div>
        </div>
      )}

      {test.notes && !editingNotes && (
        <p className="text-gray-400 text-xs leading-relaxed mb-2.5 bg-gray-800/40 rounded-lg p-2">{test.notes}</p>
      )}

      {editingNotes ? (
        <div className="mb-2.5">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes about this test..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-white text-xs mb-1.5 resize-none outline-none focus:border-indigo-500"
          />
          <div className="flex gap-1.5">
            <button onClick={handleSaveNotes} disabled={saving} className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50">Save</button>
            <span className="text-gray-700">&middot;</span>
            <button onClick={() => { setEditingNotes(false); setNotes(test.notes ?? '') }} className="text-[11px] font-semibold text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingNotes(true)}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-[11px] font-medium mb-2.5 transition-colors"
        >
          <StickyNote size={11} />
          {test.notes ? 'Edit notes' : 'Add notes'}
        </button>
      )}

      {editingMetrics ? (
        <div className="mb-2.5 space-y-1.5">
          <input
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="Store URL (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
          />
          <div className="grid grid-cols-3 gap-1.5">
            <input
              value={dailySpend}
              onChange={(e) => setDailySpend(e.target.value)}
              type="number"
              placeholder="Spend/day"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
            />
            <input
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              type="number"
              placeholder="Revenue"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
            />
            <input
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              type="number"
              placeholder="Orders"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleSaveMetrics} disabled={saving} className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50">Save</button>
            <span className="text-gray-700">&middot;</span>
            <button onClick={() => setEditingMetrics(false)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingMetrics(true)}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-[11px] font-medium mb-2.5 transition-colors"
        >
          <Pencil size={11} />
          {hasMetrics ? 'Edit numbers' : 'Add spend & revenue'}
        </button>
      )}

      {test.store_url && (
        <a
          href={test.store_url.startsWith('http') ? test.store_url : `https://${test.store_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-[11px] font-medium mb-2.5 transition-colors"
        >
          <ExternalLink size={11} />
          {test.store_url}
        </a>
      )}

      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800">
        {COLUMNS.filter((c) => c.status !== test.status).map((c) => (
          <button
            key={c.status}
            onClick={() => handleMove(c.status)}
            className="text-[10px] font-semibold text-gray-500 hover:text-white bg-gray-800/60 hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
          >
            Move to {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TestingBoardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tests, setTests] = useState<TestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PageTab>('board')
  const { toastMessage, showToast } = useToast()

  // Public shell — the Profit Calculator tab works for anyone, the My
  // Board tab needs an account since it's personal testing data.
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'calculator') {
      Promise.resolve().then(() => setActiveTab('calculator'))
    }
  }, [])

  async function loadTests() {
    if (!user) return
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('product_tests')
      .select('*, products(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to load product tests:', error.message)
      setLoading(false)
      return
    }
    setTests((data ?? []) as unknown as TestRow[])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    Promise.resolve().then(() => loadTests())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppLayout user={user}>
      <Toast message={toastMessage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={user ? '/' : '/landing'}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          {user ? 'Back to dashboard' : 'Back to home'}
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FlaskConical size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Testing Board</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Track products you&apos;re testing and run the numbers before you scale ad spend.
        </p>

        <div className="flex items-center gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'board' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <FlaskConical size={15} />
            My Board
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'calculator' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Calculator size={15} />
            Profit Calculator
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <ProfitCalculatorPanel user={user} />
        ) : !user ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-1">Sign in to use your Testing Board</h2>
            <p className="text-gray-500 text-sm mb-6">Track products, notes, and profit right from your dashboard.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {COLUMNS.map((c) => (
              <div key={c.status} className="h-64 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {COLUMNS.map((column) => {
                const columnTests = tests.filter((t) => t.status === column.status)
                const Icon = column.icon
                return (
                  <div key={column.status} className={`rounded-2xl border p-4 ${column.color}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="text-white font-semibold text-sm">{column.label}</span>
                      </div>
                      <span className="text-xs font-semibold bg-gray-900/60 px-2 py-0.5 rounded-full">{columnTests.length}</span>
                    </div>

                    {columnTests.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-gray-500 text-xs leading-relaxed">{column.emptyCopy}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {columnTests.map((test) => (
                          <TestCard key={test.id} test={test} onChanged={loadTests} showToast={showToast} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {tests.length === 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm mb-4">
                  Add products to your board from the &ldquo;Track This Product&rdquo; button on the dashboard or any product page.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Browse products
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

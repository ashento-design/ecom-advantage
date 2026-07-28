'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calculator as CalculatorIcon, Save, Share2, Check, Info, Lock } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AppLayout } from '@/app/components/AppLayout'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const STORAGE_KEY = 'launchory_calculator_saved'

type Preset = 'Conservative' | 'Moderate' | 'Aggressive'

const PRESETS: Record<Preset, { conversionRate: number; adSpend: number }> = {
  Conservative: { conversionRate: 1, adSpend: 20 },
  Moderate: { conversionRate: 2, adSpend: 50 },
  Aggressive: { conversionRate: 3.5, adSpend: 150 },
}

type Inputs = {
  productCost: number
  shippingCost: number
  sellingPrice: number
  adSpend: number
  conversionRate: number
  dailyVisitors: number
}

const DEFAULT_INPUTS: Inputs = {
  productCost: 12,
  shippingCost: 4,
  sellingPrice: 34.99,
  adSpend: 50,
  conversionRate: 2,
  dailyVisitors: 500,
}

function currency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export default function CalculatorPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS)
  const [productLabel, setProductLabel] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<Preset | null>(null)
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)

  // Public tool — no auth redirect. We still track auth state so signed-in
  // users skip the "sign up to save" CTA.
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = { ...DEFAULT_INPUTS }
    let touched = false

    const cost = params.get('cost')
    if (cost && !Number.isNaN(Number(cost))) {
      next.productCost = Number(cost)
      touched = true
    }
    const product = params.get('product')
    if (product) Promise.resolve().then(() => setProductLabel(product))

    const numericKeys: (keyof Inputs)[] = ['productCost', 'shippingCost', 'sellingPrice', 'adSpend', 'conversionRate', 'dailyVisitors']
    for (const key of numericKeys) {
      const raw = params.get(key)
      if (raw && !Number.isNaN(Number(raw))) {
        next[key] = Number(raw)
        touched = true
      }
    }

    if (touched) Promise.resolve().then(() => setInputs(next))
  }, [])

  function updateInput(key: keyof Inputs, value: number) {
    setActivePreset(null)
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(preset: Preset) {
    setActivePreset(preset)
    setInputs((prev) => ({ ...prev, conversionRate: PRESETS[preset].conversionRate, adSpend: PRESETS[preset].adSpend }))
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleShare() {
    const params = new URLSearchParams()
    Object.entries(inputs).forEach(([key, value]) => params.set(key, String(value)))
    const url = `${window.location.origin}/calculator?${params.toString()}`
    navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const { productCost, shippingCost, sellingPrice, adSpend, conversionRate, dailyVisitors } = inputs

  const profitPerUnit = sellingPrice - productCost - shippingCost
  const profitMarginPct = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0
  const breakEvenROAS = profitPerUnit > 0 ? sellingPrice / profitPerUnit : Infinity
  const dailyOrders = dailyVisitors * (conversionRate / 100)
  const dailyProfit = dailyOrders * profitPerUnit - adSpend
  const monthlyProfit = dailyProfit * 30
  const breakEvenSellingPrice = productCost + shippingCost
  const recommendedSellingPrice = productCost * 3

  const profitStatus = dailyProfit > 5 ? 'profitable' : dailyProfit >= -5 ? 'breakeven' : 'losing'
  const statusColor = { profitable: 'text-green-400', breakeven: 'text-yellow-400', losing: 'text-red-400' }[profitStatus]
  const statusBg = { profitable: 'bg-green-500/10 border-green-500/30', breakeven: 'bg-yellow-500/10 border-yellow-500/30', losing: 'bg-red-500/10 border-red-500/30' }[profitStatus]
  const statusLabel = { profitable: 'Profitable', breakeven: 'Break-even', losing: 'Losing money' }[profitStatus]

  if (!authChecked) {
    return (
      <AppLayout user={user}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-64 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <CalculatorIcon size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Profit Calculator</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {productLabel ? `Running the numbers on ${productLabel}` : 'Estimate your margins and profit before you spend on ads.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(PRESETS) as Preset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                activePreset === preset
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide text-gray-400">Inputs</h2>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Product cost (AliExpress price)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productCost}
                  onChange={(e) => updateInput('productCost', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Shipping cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => updateInput('shippingCost', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Selling price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => updateInput('sellingPrice', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Ad spend per day</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={adSpend}
                  onChange={(e) => updateInput('adSpend', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gray-400 text-xs font-medium">Conversion rate</label>
                <span className="text-white text-xs font-semibold">{conversionRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={conversionRate}
                onChange={(e) => updateInput('conversionRate', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>0.5%</span>
                <span>5%</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Expected daily visitors</label>
              <input
                type="number"
                step="1"
                min="0"
                value={dailyVisitors}
                onChange={(e) => updateInput('dailyVisitors', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                {saved ? <Check size={15} className="text-green-400" /> : <Save size={15} />}
                {saved ? 'Saved!' : 'Save Calculation'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                {shared ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
                {shared ? 'Link copied!' : 'Share Calculation'}
              </button>
            </div>

            {authChecked && !user && (
              <Link
                href="/auth/signup"
                className="flex items-center gap-2.5 bg-indigo-600/10 hover:bg-indigo-600/15 border border-indigo-500/30 rounded-lg px-4 py-3 transition-colors"
              >
                <Lock size={14} className="text-indigo-400 shrink-0" />
                <span className="text-indigo-300 text-xs font-medium">Sign up to save your calculations across devices</span>
              </Link>
            )}
          </div>

          <div className="space-y-5">
            <div className={`rounded-2xl border p-6 ${statusBg}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm uppercase tracking-wide text-gray-400">Results</h2>
                <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Profit per unit</p>
                  <p className={`text-xl font-bold ${profitPerUnit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{currency(profitPerUnit)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Profit margin</p>
                  <p className={`text-xl font-bold ${profitMarginPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profitMarginPct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Break-even ROAS</p>
                  <p className="text-xl font-bold text-white">{Number.isFinite(breakEvenROAS) ? `${breakEvenROAS.toFixed(2)}x` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Daily orders (est.)</p>
                  <p className="text-xl font-bold text-white">{dailyOrders.toFixed(1)}</p>
                </div>
              </div>

              <div className="border-t border-gray-700/50 mt-5 pt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Daily profit estimate</p>
                  <p className={`text-2xl font-bold ${dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{currency(dailyProfit)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Monthly profit estimate</p>
                  <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{currency(monthlyProfit)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold text-sm">Pricing guidance</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Break-even selling price</span>
                <span className="text-white font-semibold text-sm">{currency(breakEvenSellingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Recommended selling price (3x cost)</span>
                <span className="text-white font-semibold text-sm">{currency(recommendedSellingPrice)}</span>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 flex gap-3">
              <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-xs leading-relaxed">
                These numbers are estimates based on your inputs, not guarantees. Real conversion rates and ad
                costs vary by niche, creative, and platform — use this as a starting point, then adjust as you
                gather real data.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href={user ? '/' : '/landing'} className="text-gray-500 hover:text-white text-sm transition-colors">
            ← {user ? 'Back to dashboard' : 'Back to home'}
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}

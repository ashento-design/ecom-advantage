'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Zap, CheckCircle, Check, User } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { Navbar } from '@/app/components/Navbar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Profile = {
  email: string
  full_name: string | null
  plan: string
  analyses_used: number
}

const FREE_ANALYSIS_LIMIT = 3

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }
      setUser(authUser)

      const { data } = await supabase
        .from('profiles')
        .select('email, full_name, plan, analyses_used')
        .eq('id', authUser.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } finally {
      setUpgrading(false)
    }
  }

  const isPro = profile?.plan === 'pro'
  const analysesUsed = profile?.analyses_used ?? 0
  const usagePct = Math.min(100, Math.round((analysesUsed / FREE_ANALYSIS_LIMIT) * 100))

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            {isPro && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <p className="text-green-400 text-sm font-medium">You&apos;re on Pro — thanks for supporting Launchory.</p>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-base">{profile?.full_name ?? 'No name set'}</h2>
                    <p className="text-gray-500 text-sm">{profile?.email ?? user?.email}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    isPro
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {isPro ? 'Pro' : 'Free'}
                </span>
              </div>

              <div className="border-t border-gray-800 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">AI analyses this month</span>
                  <span className="text-white text-sm font-semibold">
                    {isPro ? 'Unlimited' : `${analysesUsed} of ${FREE_ANALYSIS_LIMIT} used`}
                  </span>
                </div>
                {!isPro && (
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePct >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {!isPro && (
              <div className="bg-gradient-to-br from-indigo-600/20 to-gray-900 border border-indigo-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={18} className="text-indigo-400" />
                  <h3 className="text-white font-bold text-lg">Upgrade to Pro</h3>
                </div>
                <p className="text-gray-400 text-sm mb-5">
                  Unlock unlimited AI analyses and full access to the product feed.
                </p>
                <div className="space-y-2 mb-6">
                  {['Unlimited AI analyses', 'Full product feed', 'Breakout alerts', 'Priority support'].map((perk) => (
                    <div key={perk} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600/30 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-indigo-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    'Upgrade to Pro - $29/month'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

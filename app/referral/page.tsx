'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Copy, Check, Users } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { Navbar } from '@/app/components/Navbar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function ReferralPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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

      const res = await fetch('/api/referral')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLoadError('Failed to load your referral info.')
        setLoading(false)
        return
      }
      setReferralCode(data.referralCode)
      setReferralCount(data.referralCount)
      setLoading(false)
    }
    load()
  }, [router])

  const referralLink = referralCode && typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : ''

  async function handleCopy() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Refer & Earn</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Refer friends, get Pro for free</h1>
        <p className="text-gray-400 text-sm mb-8">
          Refer 3 friends who upgrade to Pro and get 1 month free.
        </p>

        {loadError && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3 block">Your referral link</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm truncate"
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Users size={20} className="text-indigo-400" />
              </div>
              <div>
                <span className="text-white text-2xl font-bold">{referralCount}</span>
                <p className="text-gray-500 text-sm">
                  {referralCount === 1 ? 'friend referred' : 'friends referred'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl p-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">How it works: </span>
                Share your link with friends. When 3 of them sign up and upgrade to Pro, we&apos;ll credit your account with 1 month of Pro, free.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

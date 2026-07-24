'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LineChart, Lock, ArrowRight } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'

export function StoreIntelligenceChangelogEntry() {
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
      setIsPro(profile?.plan === 'pro')
    })
  }, [])

  if (isPro) {
    return (
      <Link
        href="/store-intelligence"
        className="relative bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4 overflow-hidden hover:border-indigo-500/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <LineChart size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium text-sm">Store Intelligence</p>
              <span className="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                NEW
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">Spy on any Shopify store&apos;s revenue and best sellers.</p>
          </div>
          <ArrowRight size={14} className="text-indigo-400 shrink-0 mt-1" />
        </div>
      </Link>
    )
  }

  return (
    <div className="relative bg-gray-900/60 border border-gray-800 rounded-xl p-4 overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
          <LineChart size={16} className="text-gray-500" />
        </div>
        <div className="min-w-0">
          <p className="text-gray-300 font-medium text-sm">Store Intelligence</p>
          <p className="text-gray-500 text-xs mt-0.5">Spy on any Shopify store&apos;s revenue and best sellers.</p>
        </div>
        <Lock size={12} className="text-gray-600 shrink-0 ml-auto mt-1" />
      </div>
    </div>
  )
}

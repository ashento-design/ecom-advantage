'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Download, Trash2, Zap } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { Navbar } from '@/app/components/Navbar'
import type { AdFormat } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type GalleryAd = {
  id: string
  ad_angle: string
  format: AdFormat
  style: string
  image_url: string
  created_at: string
  products: { title: string } | null
}

const FORMAT_LABELS: Record<AdFormat, string> = {
  square: 'Square (1:1)',
  vertical: 'Vertical (9:16)',
  horizontal: 'Horizontal (16:9)',
}

export default function AdsGalleryPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [ads, setAds] = useState<GalleryAd[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/landing')
        return
      }
      setUser(data.user)
      setAuthChecked(true)
    })
  }, [router])

  useEffect(() => {
    if (!authChecked || !user) return
    async function loadAds() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('generated_ads')
        .select('id, ad_angle, format, style, image_url, created_at, products(title)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load generated ads:', error.message)
        setLoadError(true)
        setLoading(false)
        return
      }
      setAds((data ?? []) as unknown as GalleryAd[])
      setLoading(false)
    }
    loadAds()
  }, [authChecked, user])

  async function handleDelete(id: string) {
    if (!confirm('Delete this ad? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from('generated_ads').delete().eq('id', id)
      if (error) {
        console.error('Failed to delete ad:', error.message)
        return
      }
      setAds((prev) => prev.filter((ad) => ad.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">My Ads</h1>
        <p className="text-gray-400 mb-8">AI-generated ad creatives from your product analyses.</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-20 text-gray-500">Couldn&apos;t load your ads. Please try refreshing.</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={22} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-1">No ads generated yet</h2>
            <p className="text-gray-500 text-sm mb-6">Analyze a product and generate your first AI ad creative.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Zap size={14} />
              Analyze a product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="relative bg-gray-800">
                  <img src={ad.image_url} alt={ad.ad_angle} className="w-full h-48 object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    {ad.products?.title ?? 'Product removed'}
                  </p>
                  <p className="text-white text-sm font-medium leading-snug mb-3 line-clamp-2">{ad.ad_angle}</p>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      {FORMAT_LABELS[ad.format]}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(ad.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={ad.image_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-xl transition-colors border border-gray-700"
                    >
                      <Download size={14} />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                      className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-500/40 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Sparkles, Download, Trash2, Zap, Heart, Tag, Pencil, Check, X, Plus, Video, Mail, Image as ImageIcon,
  Smartphone, Square, MonitorPlay, Clapperboard, Music2, Type, Copy, Loader2, Film,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { AppLayout } from '@/app/components/AppLayout'
import type { AdFormat } from '@/app/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type GalleryAd = {
  id: string
  ad_angle: string
  format: AdFormat
  style: string
  image_url: string
  created_at: string
  is_favorited: boolean
  tags: string[]
  custom_name: string | null
  product_id: string | null
  products: { title: string } | null
}

type ViewFilter = 'all' | 'favorites'
type SortOption = 'newest' | 'oldest' | 'favorites'

const FORMAT_LABELS: Record<AdFormat, string> = {
  square: 'Square (1:1)',
  vertical: 'Vertical (9:16)',
  horizontal: 'Horizontal (16:9)',
}

function AdCard({
  ad,
  onToggleFavorite,
  onRename,
  onAddTag,
  onRemoveTag,
  onDelete,
  deleting,
}: {
  ad: GalleryAd
  onToggleFavorite: (ad: GalleryAd) => void
  onRename: (ad: GalleryAd, name: string) => void
  onAddTag: (ad: GalleryAd, tag: string) => void
  onRemoveTag: (ad: GalleryAd, tag: string) => void
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(ad.custom_name ?? ad.ad_angle)
  const [addingTag, setAddingTag] = useState(false)
  const [tagDraft, setTagDraft] = useState('')

  function handleSaveName() {
    onRename(ad, nameDraft.trim())
    setRenaming(false)
  }

  function handleSubmitTag() {
    if (tagDraft.trim()) onAddTag(ad, tagDraft)
    setTagDraft('')
    setAddingTag(false)
  }

  const displayName = ad.custom_name || ad.ad_angle

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="relative bg-gray-800">
        <img src={ad.image_url} alt={displayName} className="w-full h-48 object-cover" />
        <button
          onClick={() => onToggleFavorite(ad)}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700"
          aria-label={ad.is_favorited ? 'Unfavorite' : 'Favorite'}
        >
          <Heart size={14} className={ad.is_favorited ? 'text-red-400 fill-red-400' : 'text-gray-400'} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
          {ad.products?.title ?? 'Product removed'}
        </p>

        {renaming ? (
          <div className="flex items-center gap-1.5 mb-3">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none focus:border-indigo-500"
            />
            <button onClick={handleSaveName} className="shrink-0 text-emerald-400 hover:text-emerald-300">
              <Check size={16} />
            </button>
            <button onClick={() => { setRenaming(false); setNameDraft(ad.custom_name ?? ad.ad_angle) }} className="shrink-0 text-gray-500 hover:text-gray-300">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 mb-3">
            <p className="text-white text-sm font-medium leading-snug line-clamp-2 flex-1">{displayName}</p>
            <button
              onClick={() => setRenaming(true)}
              className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
              aria-label="Rename ad"
              title="Rename"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            {FORMAT_LABELS[ad.format]}
          </span>
          <span className="text-gray-500 text-xs">{new Date(ad.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {ad.tags.map((tag) => (
            <span
              key={tag}
              className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-800 text-gray-300 border border-gray-700"
            >
              {tag}
              <button onClick={() => onRemoveTag(ad, tag)} className="text-gray-600 group-hover:text-red-400 transition-colors" aria-label={`Remove tag ${tag}`}>
                <X size={10} />
              </button>
            </span>
          ))}
          {addingTag ? (
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitTag()}
              onBlur={handleSubmitTag}
              autoFocus
              placeholder="tag name"
              className="w-24 bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-white text-[11px] outline-none focus:border-indigo-500"
            />
          ) : (
            <button
              onClick={() => setAddingTag(true)}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-gray-500 hover:text-gray-300 border border-dashed border-gray-700 hover:border-gray-600 transition-colors"
            >
              <Plus size={10} />
              Tag
            </button>
          )}
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
            onClick={() => onDelete(ad.id)}
            disabled={deleting}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-500/40 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoWaitlistForm({ prompt }: { prompt: string }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/video-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error === 'invalid_email' ? 'Please enter a valid email address.' : 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium">
        <Check size={15} />
        You&apos;re on the list — we&apos;ll email you when it&apos;s ready.
      </p>
    )
  }

  return (
    <div>
      <p className="text-gray-400 text-sm mb-3">{prompt}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {submitting ? 'Joining…' : 'Join Waitlist'}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  )
}

type AnalyzedOption = {
  productId: string | null
  title: string
  description: string
  adAngles: string[]
}

type VideoFormat = 'vertical' | 'square' | 'horizontal'
type VideoStyle = 'ugc' | 'showcase' | 'testimonial' | 'text_forward'

type VideoScript = {
  script: string
  scenes: { scene_number: number; description: string; text_overlay: string }[]
  voiceover: string
  music_suggestion: string
  estimated_duration: string
}

const VIDEO_FORMATS: { value: VideoFormat; label: string; icon: typeof Smartphone }[] = [
  { value: 'vertical', label: 'Vertical 9:16 (TikTok/Reels)', icon: Smartphone },
  { value: 'square', label: 'Square 1:1 (Instagram)', icon: Square },
  { value: 'horizontal', label: 'Horizontal 16:9 (YouTube)', icon: MonitorPlay },
]

const VIDEO_STYLES: { value: VideoStyle; label: string }[] = [
  { value: 'ugc', label: 'UGC Style' },
  { value: 'showcase', label: 'Product Showcase' },
  { value: 'testimonial', label: 'Testimonial Style' },
  { value: 'text_forward', label: 'Text-Forward' },
]

const VIDEO_DURATIONS = ['15', '30', '60']

function VideoAdGenerator({ user }: { user: SupabaseUser }) {
  const [options, setOptions] = useState<AnalyzedOption[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedAngle, setSelectedAngle] = useState('')
  const [format, setFormat] = useState<VideoFormat>('vertical')
  const [style, setStyle] = useState<VideoStyle>('ugc')
  const [duration, setDuration] = useState('30')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VideoScript | null>(null)
  const [voiceoverCopied, setVoiceoverCopied] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('ai_analyses')
      .select('product_id, ad_angles, created_at, products(title, description)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error('Failed to load analyzed products:', fetchError.message)
          setOptionsLoading(false)
          return
        }
        const seen = new Set<string>()
        const deduped: AnalyzedOption[] = []
        for (const row of (data ?? []) as unknown as Array<{
          product_id: string | null
          ad_angles: string[] | null
          products: { title: string; description: string } | null
        }>) {
          const title = row.products?.title
          if (!title || !row.ad_angles?.length) continue
          const key = row.product_id ?? title
          if (seen.has(key)) continue
          seen.add(key)
          deduped.push({
            productId: row.product_id,
            title,
            description: row.products?.description ?? '',
            adAngles: row.ad_angles,
          })
        }
        setOptions(deduped)
        setOptionsLoading(false)
      })
  }, [user.id])

  const selectedProduct = selectedIndex !== null ? options[selectedIndex] : null

  function handleSelectProduct(index: number) {
    setSelectedIndex(index)
    setSelectedAngle(options[index].adAngles[0] ?? '')
    setResult(null)
    setError(null)
  }

  async function handleGenerate() {
    if (!selectedProduct || !selectedAngle) return
    setGenerating(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/generate-video-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: selectedProduct.title,
          productDescription: selectedProduct.description,
          adAngle: selectedAngle,
          format,
          style,
          duration,
          productId: selectedProduct.productId,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError('Could not generate a script right now. Please try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopyVoiceover() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.voiceover)
      setVoiceoverCopied(true)
      setTimeout(() => setVoiceoverCopied(false), 1800)
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Clapperboard size={18} className="text-indigo-400" />
            Video Ad Script Generator
          </h2>
          <p className="text-gray-400 text-sm mt-1">Get a full scene-by-scene script and voiceover, ready to film with any video editor.</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600/15 text-indigo-400 border border-indigo-500/30">
          <Sparkles size={12} />
          Beta — Powered by AI
        </span>
      </div>

      {optionsLoading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl h-48 animate-pulse" />
      ) : options.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video size={22} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Analyze a product first</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            The video script generator reuses the ad angles from an AI analysis — run one from the dashboard, then come back here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Zap size={14} />
            Analyze a product
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
            <select
              value={selectedIndex ?? ''}
              onChange={(e) => handleSelectProduct(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
            >
              <option value="" disabled>Select an analyzed product…</option>
              {options.map((opt, i) => (
                <option key={i} value={i}>{opt.title}</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ad Angle</label>
                <div className="space-y-2">
                  {selectedProduct.adAngles.map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => setSelectedAngle(angle)}
                      className={`w-full text-left p-3 rounded-xl text-sm border transition-colors ${
                        selectedAngle === angle
                          ? 'bg-indigo-600/15 border-indigo-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {angle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VIDEO_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border transition-colors ${
                        format === f.value
                          ? 'bg-indigo-600/15 border-indigo-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <f.icon size={15} className="shrink-0" />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIDEO_STYLES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStyle(s.value)}
                        className={`p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                          style === s.value
                            ? 'bg-indigo-600/15 border-indigo-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                  <div className="flex gap-2">
                    {VIDEO_DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`flex-1 p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                          duration === d
                            ? 'bg-indigo-600/15 border-indigo-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <X size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !selectedAngle}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Writing your script…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Video Script
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 mt-6">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Concept</p>
            <p className="text-gray-300 text-sm leading-relaxed">{result.script}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Film size={15} className="text-indigo-400" />
              <span className="text-white font-semibold text-sm">Scene-by-Scene Breakdown</span>
              <span className="text-gray-500 text-xs">({result.estimated_duration})</span>
            </div>
            <div className="space-y-2">
              {result.scenes.map((scene) => (
                <div key={scene.scene_number} className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 bg-indigo-600/30 text-indigo-400 rounded-md flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                      {scene.scene_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm leading-relaxed">{scene.description}</p>
                      {scene.text_overlay && (
                        <p className="flex items-center gap-1.5 text-indigo-400 text-xs mt-2">
                          <Type size={12} />
                          &ldquo;{scene.text_overlay}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold text-sm">Voiceover Script</span>
              <button
                onClick={handleCopyVoiceover}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-white transition-colors"
              >
                {voiceoverCopied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl text-gray-300 text-sm leading-relaxed italic">
              &ldquo;{result.voiceover}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2 p-3.5 bg-gray-800/60 border border-gray-700/60 rounded-xl">
            <Music2 size={15} className="text-orange-400 shrink-0" />
            <p className="text-gray-300 text-sm"><span className="text-gray-500">Music mood:</span> {result.music_suggestion}</p>
          </div>

          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-300 text-sm">This script is ready to use with CapCut, InShot, or any video editor.</p>
          </div>

          <div className="border-t border-gray-800 pt-5">
            {!showWaitlist ? (
              <button
                onClick={() => setShowWaitlist(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                <Video size={15} />
                Generate with AI Video (Coming Soon)
              </button>
            ) : (
              <VideoWaitlistForm prompt="Want Launchory to generate the actual video from this script? Join the waitlist and we'll email you the moment it's ready." />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdsGalleryPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [ads, setAds] = useState<GalleryAd[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [formatFilter, setFormatFilter] = useState<'all' | AdFormat>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [activeGalleryTab, setActiveGalleryTab] = useState<'image' | 'video'>('image')
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
        .select('id, ad_angle, format, style, image_url, created_at, is_favorited, tags, custom_name, product_id, products(title)')
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

  async function updateAd(id: string, fields: Partial<Pick<GalleryAd, 'is_favorited' | 'tags' | 'custom_name'>>) {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('generated_ads').update(fields).eq('id', id)
    if (error) {
      console.error('Failed to update ad:', error.message)
      return
    }
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...fields } : ad)))
  }

  function handleToggleFavorite(ad: GalleryAd) {
    updateAd(ad.id, { is_favorited: !ad.is_favorited })
  }

  function handleRename(ad: GalleryAd, name: string) {
    updateAd(ad.id, { custom_name: name || null })
  }

  function handleAddTag(ad: GalleryAd, tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || ad.tags.includes(trimmed)) return
    updateAd(ad.id, { tags: [...ad.tags, trimmed] })
  }

  function handleRemoveTag(ad: GalleryAd, tag: string) {
    updateAd(ad.id, { tags: ad.tags.filter((t) => t !== tag) })
  }

  const uniqueProducts = Array.from(
    new Map(
      ads.filter((a) => a.product_id && a.products?.title).map((a) => [a.product_id as string, a.products!.title])
    ).entries()
  )
  const uniqueTags = Array.from(new Set(ads.flatMap((a) => a.tags))).sort()

  let visibleAds = ads
  if (viewFilter === 'favorites') visibleAds = visibleAds.filter((a) => a.is_favorited)
  if (formatFilter !== 'all') visibleAds = visibleAds.filter((a) => a.format === formatFilter)
  if (productFilter !== 'all') visibleAds = visibleAds.filter((a) => a.product_id === productFilter)
  if (tagFilter !== 'all') visibleAds = visibleAds.filter((a) => a.tags.includes(tagFilter))

  visibleAds = [...visibleAds].sort((a, b) => {
    if (sortBy === 'favorites' && a.is_favorited !== b.is_favorited) {
      return a.is_favorited ? -1 : 1
    }
    const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return sortBy === 'oldest' ? -diff : diff
  })

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">My Ads</h1>
        <p className="text-gray-400 mb-6">AI-generated ad creatives from your product analyses.</p>

        <div className="flex items-center gap-6 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveGalleryTab('image')}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors ${
              activeGalleryTab === 'image' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <ImageIcon size={15} />
            Image Ads
          </button>
          <button
            onClick={() => setActiveGalleryTab('video')}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors ${
              activeGalleryTab === 'video' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Video size={15} />
            Video Ads <span className="text-gray-600 font-normal">(Coming Soon)</span>
          </button>
        </div>

        {activeGalleryTab === 'video' ? (
          <VideoAdGenerator user={user!} />
        ) : (
          <>

        {!loading && !loadError && ads.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex gap-2">
              {(['all', 'favorites'] as ViewFilter[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewFilter(v)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    viewFilter === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {v === 'favorites' && <Heart size={13} className={viewFilter === v ? 'fill-white' : ''} />}
                  {v === 'all' ? 'All Ads' : 'Favorites'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as 'all' | AdFormat)}
                className="bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-3 py-2 outline-none focus:border-gray-600 transition-colors"
              >
                <option value="all">All Formats</option>
                <option value="square">Square</option>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>

              {uniqueProducts.length > 0 && (
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-3 py-2 outline-none focus:border-gray-600 transition-colors max-w-[10rem]"
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              )}

              {uniqueTags.length > 0 && (
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-3 py-2 outline-none focus:border-gray-600 transition-colors"
                >
                  <option value="all">All Tags</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-900 border border-gray-800 text-gray-300 text-sm font-medium rounded-xl px-3 py-2 outline-none focus:border-gray-600 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>
          </div>
        )}

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
        ) : visibleAds.length === 0 ? (
          <div className="text-center py-20">
            <Tag size={20} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No ads match these filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onToggleFavorite={handleToggleFavorite}
                onRename={handleRename}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onDelete={handleDelete}
                deleting={deletingId === ad.id}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

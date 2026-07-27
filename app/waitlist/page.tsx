import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, Zap, Megaphone, TrendingUp, Users, Gem, Sparkles, MessageSquareHeart } from 'lucide-react'
import { getServiceRoleClient } from '@/app/lib/supabaseAdmin'
import { WaitlistEmailForm } from '@/app/components/WaitlistEmailForm'

export const dynamic = 'force-dynamic'

const WAITLIST_TITLE = 'Join the Waitlist'
const WAITLIST_DESCRIPTION = 'AI-powered product research for Shopify dropshippers. Join the waitlist for founding member pricing before our Fall 2026 launch.'

export const metadata: Metadata = {
  title: WAITLIST_TITLE,
  description: WAITLIST_DESCRIPTION,
  openGraph: {
    title: `${WAITLIST_TITLE} — Launchory`,
    description: WAITLIST_DESCRIPTION,
    url: 'https://launchory.io/waitlist',
    siteName: 'Launchory',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${WAITLIST_TITLE} — Launchory`,
    description: WAITLIST_DESCRIPTION,
  },
}

const FOUNDING_SPOTS = 200

const benefits = [
  { icon: Gem, title: 'Founding Member Price', description: '$19/mo locked in forever — the public launch price is $29/mo.' },
  { icon: Sparkles, title: 'Early Access', description: 'Get into the product before the public Fall 2026 launch.' },
  { icon: MessageSquareHeart, title: 'Shape the Product', description: 'Your feedback directly influences what we build next.' },
]

const featurePreview = [
  { icon: Zap, title: 'AI Product Analyzer', description: 'Instant demand scores and competition analysis for any product.' },
  { icon: Megaphone, title: 'Ad Creative Generator', description: 'AI-generated ad creatives and angles, ready to run.' },
  { icon: TrendingUp, title: 'Store Intelligence', description: 'See how much any competitor store is really making.' },
]

const avatars = [
  { initials: 'AK', color: 'bg-indigo-600' },
  { initials: 'TR', color: 'bg-emerald-600' },
  { initials: 'MJ', color: 'bg-orange-600' },
]

async function getWaitlistCount(): Promise<number> {
  try {
    const supabaseAdmin = getServiceRoleClient()
    const { count, error } = await supabaseAdmin
      .from('waitlist_subscribers')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  } catch (err) {
    console.error('[waitlist] Failed to fetch waitlist count:', err)
    return 0
  }
}

export default async function WaitlistPage() {
  const count = await getWaitlistCount()
  const spotsClaimed = Math.min(count, FOUNDING_SPOTS)
  const spotsPercent = Math.round((spotsClaimed / FOUNDING_SPOTS) * 100)
  const socialProofText = count > 0 ? `Join ${count}+ dropshippers already waiting` : 'Be one of the first dropshippers to join'
  const heroCountText = count > 0 ? `Already ${count} dropshipper${count === 1 ? '' : 's'} on the waitlist` : 'Be the first to join the waitlist'

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-indigo-600/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Link href="/landing" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Launchory</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
            🚀 Launching Fall 2026
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            The Product Research Tool Built By a Dropshipper, For Dropshippers
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Launchory finds winning products, analyzes competition, and generates your ads — all in one place. Join the waitlist for founding member pricing.
          </p>

          <div className="max-w-lg mx-auto">
            <WaitlistEmailForm source="hero" />
            <p className="text-gray-500 text-sm mt-4">{heroCountText}</p>
            <p className="text-gray-600 text-xs mt-2">
              Free to join. Founding member price locked at $19/mo when you upgrade.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {avatars.map((a) => (
              <div
                key={a.initials}
                className={`w-8 h-8 rounded-full ${a.color} border-2 border-gray-900 flex items-center justify-center text-white text-[11px] font-bold`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <p className="text-gray-300 text-sm font-medium">{socialProofText}</p>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">What waitlist members get</h2>
          <p className="text-gray-400">Join now, not when everyone else does.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <b.icon size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{b.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature preview */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">What you&rsquo;ll be able to do</h2>
            <p className="text-gray-400">A sneak peek at what&rsquo;s launching Fall 2026.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featurePreview.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-11 h-11 bg-indigo-600/15 border border-indigo-500/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <f.icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium mb-6">
          <Users size={12} />
          Limited founding member spots
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Founding member spots are limited to the first {FOUNDING_SPOTS} subscribers
        </h2>
        <p className="text-gray-400 mb-8">
          After that, the $19/mo founding price is gone for good — everyone else pays $29/mo at launch.
        </p>

        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>{spotsClaimed} of {FOUNDING_SPOTS} spots claimed</span>
          <span>{spotsPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-800 overflow-hidden mb-10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-orange-500 transition-all duration-500"
            style={{ width: `${Math.max(spotsPercent, 2)}%` }}
          />
        </div>

        <WaitlistEmailForm source="urgency_bottom" className="max-w-lg mx-auto" />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="text-gray-500 text-sm">By Ecom Advantage &mdash; the brand trusted by 50,000+ dropshippers</span>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">launchory.io</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

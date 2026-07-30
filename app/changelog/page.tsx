import type { Metadata } from 'next'
import {
  Sparkles, Puzzle, TrendingUp, Zap, Video,
  ShoppingCart, Smartphone, Users, Lock, BarChart3,
} from 'lucide-react'
import { StoreIntelligenceChangelogEntry } from '@/app/components/StoreIntelligenceChangelogEntry'
import { AppLayout } from '@/app/components/AppLayout'
import { createServerClient } from '@/app/lib/supabase'

export const metadata: Metadata = {
  title: 'Changelog',
  description: "See what's new in Launchory and what's coming next.",
}

const releases = [
  {
    version: '0.8',
    date: 'July 2026',
    current: true,
    items: [
      'AI Ad Creative Generator — Turn any product into scroll-stopping ad images in seconds, no design skills required',
      'Ad Gallery — Every ad creative you generate, saved in one place and ready to download and launch',
      'One-click supplier search — Jump straight to AliExpress, CJDropshipping, or Zendrop for any product, no manual searching',
      'Smarter AI analysis — Every product now comes with target audience insights, best ad platforms, seasonality timing, and its key "wow factor"',
      'Refer & earn — Invite fellow dropshippers to Launchory and earn rewards for every signup',
    ],
  },
  {
    version: '0.7',
    date: 'July 2026',
    items: [
      'Full product deep-dives — Every product now has its own page with complete analysis, supplier links, and more',
      'Instant search — Find any winning product in the feed in seconds',
      'Save your favorites — Bookmark winning products to revisit anytime',
      'Curated feeds — Browse Hot This Week, New Arrivals, and Staff Picks to find winners faster',
    ],
  },
  {
    version: '0.6',
    date: 'June 2026',
    items: [
      'Pro Plan launched — Unlock unlimited AI analyses, the full product feed, and priority features for $29/month',
      'Free tier introduced — Try Launchory with 3 complimentary AI analyses, no credit card required',
      'Account dashboard — See your plan and usage, and manage your subscription in one place',
      'Launchory on the go — Full mobile support so you can research winning products from anywhere',
    ],
  },
  {
    version: '0.5',
    date: 'June 2026',
    items: [
      'AI Product Analyzer launched — Get instant demand scores, competition analysis, ready-to-use ad angles, and scroll-stopping hooks for any product',
      'Secure accounts — Sign up and save your research, analyses, and ad creatives across sessions',
      'Daily winning products — A curated feed of trending products across 12 niches, updated every day',
    ],
  },
]

const comingSoon = [
  { icon: Puzzle, title: 'Chrome Extension', description: 'Analyze any AliExpress product instantly while you browse, without leaving the page.' },
  { icon: TrendingUp, title: 'TikTok Trend Integration', description: 'See which products are going viral on TikTok before they peak.' },
  { icon: Video, title: 'Video Ad Generator', description: 'Create scroll-stopping video ads, not just images.' },
  { icon: Zap, title: 'Automated Product Discovery', description: 'AI finds and adds new winning products to your feed daily.' },
  { icon: BarChart3, title: 'Competitor Store Tracker', description: "Deep-dive analytics on any Shopify store's full product catalog." },
  { icon: ShoppingCart, title: 'One-Click Shopify Import', description: 'Add winning products directly to your store from Launchory.' },
  { icon: Smartphone, title: 'Mobile App', description: 'Full Launchory experience on iOS and Android.' },
  { icon: Users, title: 'Team Accounts', description: 'Share your research and ad creatives with your team or VA.' },
]

export default async function ChangelogPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Changelog</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">What&apos;s new in Launchory</h1>
          <p className="text-gray-400">A running history of everything we&apos;ve shipped — and what&apos;s coming next.</p>
        </div>

        {/* Release timeline */}
        <div className="relative pl-8 mb-20">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-800" />
          <div className="space-y-12">
            {releases.map((release) => (
              <div key={release.version} className="relative">
                <div
                  className={`absolute -left-8 top-1 w-5 h-5 rounded-full border-4 border-gray-950 ${
                    release.current ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                />
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h2 className="text-white font-bold text-xl">v{release.version}</h2>
                  <span className="text-gray-500 text-sm">{release.date}</span>
                  {release.current && (
                    <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Current Beta
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
                  {release.items.map((item) => {
                    const [title, ...rest] = item.split(' — ')
                    const description = rest.join(' — ')
                    return (
                      <li key={item} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-white font-medium text-sm">{title}</p>
                        {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-gray-500" />
            <h2 className="text-white font-bold text-lg">Coming soon</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StoreIntelligenceChangelogEntry />
            {comingSoon.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-gray-900/60 border border-gray-800 rounded-xl p-4 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                    <feature.icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-300 font-medium text-sm">{feature.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{feature.description}</p>
                  </div>
                  <Lock size={12} className="text-gray-600 shrink-0 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

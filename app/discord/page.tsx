import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, MessageCircle, Zap, Megaphone, TrendingUp, Users } from 'lucide-react'
import { WaitlistEmailForm } from '@/app/components/WaitlistEmailForm'

export const metadata: Metadata = {
  title: 'Exclusive for Discord Members',
  description: 'Launchory — AI-powered product research for Shopify dropshippers. Join the waitlist for founding member pricing.',
  // Source-specific landing page — reached via a direct link shared in
  // Discord, not meant to be discovered through organic search.
  robots: { index: false, follow: true },
}

const perks = [
  { icon: Zap, title: 'AI Product Analyzer', description: 'Instant demand scores and competition analysis for any product.' },
  { icon: Megaphone, title: 'Ad Creative Generator', description: 'AI-generated ad creatives and angles, ready to run.' },
  { icon: TrendingUp, title: 'Store Intelligence', description: 'See how much any competitor store is really making.' },
]

export default function DiscordLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <section className="relative overflow-hidden pt-20 pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-indigo-600/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <Link href="/landing" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Launchory</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
            <MessageCircle size={13} />
            Exclusive for Ecom Advantage Discord members
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
            The Product Research Tool Built By a Dropshipper, For Dropshippers
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-3 leading-relaxed">
            You&rsquo;re already in the community — get first access to the tool Alex built to solve product research for the whole server.
          </p>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
            AI product analysis, ad creative generation, and competitor store intelligence — all in one place.
          </p>

          <div className="max-w-lg mx-auto">
            <WaitlistEmailForm source="discord" />
            <p className="text-gray-600 text-xs mt-4">
              Free to join. Founding member price locked at <span className="text-indigo-400 font-medium">$19/mo</span> when you upgrade — launching Fall 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Community angle */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-12 h-12 bg-indigo-600/15 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users size={20} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Built with the community, for the community</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-12">
            Launchory started as a way to solve the same product-research problem the Ecom Advantage Discord talks about every day. Waitlist members get a direct line to shape what ships next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {perks.map((p) => (
              <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="w-10 h-10 bg-indigo-600/15 border border-indigo-500/30 rounded-lg flex items-center justify-center mb-3">
                  <p.icon size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{p.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="text-gray-500 text-sm">By Ecom Advantage</span>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">launchory.io</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

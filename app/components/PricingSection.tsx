'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Minus, ChevronDown, ShieldCheck, MessageCircle, Info, Quote } from 'lucide-react'

const freeFeatures: { label: string; tip: string }[] = [
  { label: '3 AI analyses / month', tip: 'Get demand score, competition level, and ad angles for 3 products every month.' },
  { label: 'Basic product feed', tip: "Browse today's curated list of trending products." },
]

const proFeatures: { label: string; tip: string }[] = [
  { label: 'Unlimited AI analyses', tip: 'Run AI analysis on as many products as you want, no monthly cap.' },
  { label: 'Full product feed', tip: 'See every product in the feed, not just the top picks.' },
  { label: 'AI ad image generation', tip: 'Generate scroll-stopping ad creatives from any product with one click.' },
  { label: 'Breakout alerts', tip: "Get notified the moment a product's views start spiking." },
  { label: 'Priority support', tip: 'Jump the queue when you need help — faster response times.' },
]

const miniQuotes = [
  { quote: 'Paid for itself with the first product I tested.', name: 'Marcus R.' },
  { quote: 'The ad angles alone save me an hour per product.', name: 'Priya S.' },
]

const comparisonRows: { label: string; launchory: string; minea: string; dropship: string; highlight?: boolean }[] = [
  { label: 'Price', launchory: '$19–29/mo', minea: '$49/mo', dropship: '$29–99/mo' },
  { label: 'AI Analysis', launchory: 'Unlimited (Pro)', minea: 'Limited', dropship: 'Limited' },
  { label: 'Ad Generation', launchory: 'Built-in AI ad images', minea: '—', dropship: '—', highlight: true },
  { label: 'Daily Products', launchory: '15+', minea: '10+', dropship: '20+' },
  { label: 'Supplier Links', launchory: 'Auto-matched', minea: 'Manual', dropship: 'Auto-matched' },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There\'s no contract — cancel your Pro subscription anytime from your account page and you\'ll keep access until the end of your billing period.',
  },
  {
    q: 'What happens when I hit the free plan limit?',
    a: 'You\'ll see an upgrade prompt when you run out of free AI analyses or ad generations. Your saved products and account stay intact — upgrading just unlocks unlimited usage instantly.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If Pro isn\'t a fit within your first 7 days, reach out and we\'ll refund you in full, no questions asked.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan itself works as an ongoing trial — 3 AI analyses a month with no time limit and no credit card required, so you can try the core product before upgrading.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards via Stripe. Annual plans are billed once per year; monthly plans are billed every 30 days.',
  },
]

function FeatureItem({ label, tip, tone }: { label: string; tip: string; tone: 'gray' | 'indigo' }) {
  const [open, setOpen] = useState(false)
  const dotClass = tone === 'indigo' ? 'bg-indigo-600/30' : 'bg-gray-800'
  const checkClass = tone === 'indigo' ? 'text-indigo-400' : 'text-gray-400'

  return (
    <div className="relative flex items-center gap-2.5">
      <div className={`w-4 h-4 rounded-full ${dotClass} flex items-center justify-center shrink-0`}>
        <Check size={10} className={checkClass} />
      </div>
      <span className="text-gray-300 text-sm">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-gray-600 hover:text-gray-400 transition-colors"
        aria-label={`What is ${label}?`}
      >
        <Info size={12} />
      </button>
      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-56 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-xl z-10">
          {tip}
        </div>
      )}
    </div>
  )
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const proPrice = annual ? 19 : 29

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
        <p className="text-gray-400">Start free. Upgrade when you&apos;re ready to scale.</p>
      </div>

      {/* Mini testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
        {miniQuotes.map((t) => (
          <div key={t.name} className="flex items-start gap-2.5 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <Quote size={14} className="text-indigo-500/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-300 text-sm italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-gray-500 text-xs mt-1.5">— {t.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mb-14">
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className="relative w-12 h-6 rounded-full bg-gray-800 border border-gray-700 transition-colors"
          aria-label="Toggle annual pricing"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-indigo-500 transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`}
            style={{ width: '1.125rem', height: '1.125rem' }}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
          Annual
          <span className="ml-2 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
            Saves $120/year
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
        <div className="h-full flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-white font-semibold text-lg mb-1">Free</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="text-gray-500 text-sm">/mo</span>
          </div>
          <div className="space-y-3 mb-8">
            {freeFeatures.map((f) => (
              <FeatureItem key={f.label} label={f.label} tip={f.tip} tone="gray" />
            ))}
          </div>
          <div className="mt-auto">
            <Link
              href="/auth/signup"
              className="block text-center w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors border border-gray-700"
            >
              Start Free — No Credit Card
            </Link>
          </div>
        </div>

        <div className="h-full flex flex-col bg-indigo-950 border border-indigo-500/40 rounded-2xl p-8 relative">
          <div className="absolute -top-3 left-8 flex items-center gap-2 flex-wrap">
            <span className="relative bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-40" aria-hidden />
              <span className="relative">Most Popular</span>
            </span>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1 mt-2">Pro</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-white">${proPrice}</span>
            <span className="text-gray-500 text-sm">/mo</span>
          </div>
          <p className="text-gray-500 text-xs mb-1">{annual ? 'billed annually ($228/year)' : 'billed monthly'}</p>
          <p className="text-orange-400 text-xs font-medium mb-6">
            Beta pricing ends October 2025 — locks in at $29/mo forever
          </p>
          <div className="space-y-3 mb-6">
            {proFeatures.map((f) => (
              <FeatureItem key={f.label} label={f.label} tip={f.tip} tone="indigo" />
            ))}
          </div>
          <div className="flex items-center gap-2 mb-6 text-emerald-400">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="text-xs font-medium">7-day money back guarantee</span>
          </div>
          <div className="mt-auto">
            <Link
              href="/auth/signup"
              className="block text-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-20">
        <a
          href="mailto:hello@launchory.io"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          <MessageCircle size={14} />
          Questions? Chat with us
        </a>
      </div>

      {/* Comparison table */}
      <div className="max-w-3xl mx-auto mb-20">
        <h3 className="text-center text-xl font-bold text-white mb-8">How Launchory compares</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 font-medium">Feature</th>
                  <th className="px-5 py-4 font-medium text-indigo-400">Launchory</th>
                  <th className="px-5 py-4 font-medium">Minea</th>
                  <th className="px-5 py-4 font-medium">Dropship.io</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-800/60 last:border-b-0">
                    <td className="px-5 py-4 text-gray-400 font-medium">{row.label}</td>
                    <td className={`px-5 py-4 font-semibold ${row.highlight ? 'text-indigo-400' : 'text-white'}`}>
                      {row.launchory}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {row.minea === '—' ? <Minus size={14} className="text-gray-600" /> : row.minea}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {row.dropship === '—' ? <Minus size={14} className="text-gray-600" /> : row.dropship}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-center text-xl font-bold text-white mb-8">Frequently asked questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-white font-medium text-sm">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

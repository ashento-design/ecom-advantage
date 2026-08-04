import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Rocket, ArrowRight, Puzzle, Search, Zap, BarChart3,
  Download, FolderOpen, ToggleRight, Settings2, CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chrome Extension',
  description: 'Analyze any AliExpress product instantly with the Launchory Chrome extension — no copy-pasting, no extra tabs.',
}

const steps = [
  {
    icon: Search,
    title: 'Detects AliExpress products automatically',
    description: 'A floating "Analyze with Launchory" button appears the moment you land on a product page — no setup required.',
  },
  {
    icon: Zap,
    title: 'One-click AI analysis',
    description: 'Click the button and Launchory opens with your product already loaded, ready to analyze.',
  },
  {
    icon: BarChart3,
    title: 'Full demand scores, ad angles, and hooks instantly',
    description: 'Demand score, competition level, pricing, ad angles, and video hooks — all in seconds.',
  },
]

const installSteps = [
  {
    icon: Download,
    text: <>Download the extension files — email <a href="mailto:hello@launchory.io" className="text-indigo-400 hover:text-indigo-300 transition-colors">hello@launchory.io</a> if you don&apos;t have them yet.</>,
  },
  {
    icon: FolderOpen,
    text: <>Unzip the folder, then open Chrome and go to <code className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded text-sm">chrome://extensions</code>.</>,
  },
  {
    icon: ToggleRight,
    text: 'Toggle Developer mode on (top-right corner).',
  },
  {
    icon: Settings2,
    text: <>Click <span className="text-white font-medium">Load unpacked</span> and select the unzipped extension folder.</>,
  },
  {
    icon: CheckCircle2,
    text: 'Pin the Launchory icon to your toolbar — you\'re ready to analyze products.',
  },
]

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="px-3 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-24">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-6">
            <Puzzle size={12} />
            Chrome Extension — Available Now
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 max-w-2xl mx-auto">
            Analyze AliExpress Products Instantly
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            A floating button appears on every AliExpress product page — one click and Launchory&apos;s full AI analysis is ready, without leaving the page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#install"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Install Extension
              <ArrowRight size={16} />
            </a>
            <span className="text-gray-500 text-sm">Chrome Web Store — Submission Pending</span>
          </div>

          {/* Illustrated mockup */}
          <div className="relative max-w-lg mx-auto mt-16">
            <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-2xl" aria-hidden />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 text-left">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-gray-500 text-xs">aliexpress.com/item/…</span>
              </div>
              <div className="relative h-56 bg-gradient-to-br from-gray-800/60 via-gray-900 to-gray-900 p-5">
                <div className="w-2/3 h-3 bg-gray-800 rounded mb-2" />
                <div className="w-1/2 h-3 bg-gray-800 rounded mb-5" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-gray-800 rounded-lg" />
                  <div className="h-16 bg-gray-800 rounded-lg" />
                  <div className="h-16 bg-gray-800 rounded-lg" />
                </div>
                <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg shadow-indigo-900/40">
                  🚀 Analyze with Launchory
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">What it does</h2>
          <p className="text-gray-400">Research winning products without breaking your browsing flow.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <step.icon size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install instructions */}
      <section id="install" className="max-w-4xl mx-auto px-6 py-20 scroll-mt-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Install Extension</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The extension isn&apos;t on the Chrome Web Store yet (submission pending) — here&apos;s how to load it manually in developer mode in the meantime.
            </p>
          </div>
          <div className="space-y-5 max-w-lg mx-auto">
            {installSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 shrink-0 bg-indigo-600/15 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                  <step.icon size={16} className="text-indigo-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-1.5">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs text-center mt-10">
            By installing, you agree to our{' '}
            <Link href="/extension/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Chrome Extension Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Start finding winning products today</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Install the extension and get your first AI analysis before you finish this cup of coffee.</p>
          <a
            href="#install"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Install Extension
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-500 text-sm">Launchory &copy; 2026</span>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Blog</Link>
            <Link href="/changelog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Changelog</Link>
            <Link href="/help" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Help</Link>
            <Link href="/extension/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Extension Privacy</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

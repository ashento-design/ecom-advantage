import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chrome Extension Privacy Policy',
  description: 'How the Launchory Chrome extension collects, uses, and protects your data.',
}

const sections = [
  {
    title: 'What we collect',
    body: 'The Launchory extension only sends data to our servers when you actively click "Analyze with Launchory" — either the floating on-page button or the "Analyze This Product" button in the extension popup. At that moment, we send the product page URL you were viewing on AliExpress, and the product title read from that page. Nothing is collected in the background, and nothing is collected just from installing the extension or browsing AliExpress without clicking Analyze.',
  },
  {
    title: 'What we do NOT collect',
    body: 'The extension does not collect, and never sends to our servers, your general browsing history or activity on any site other than the specific AliExpress page you chose to analyze; personal information such as your name, address, or phone number; passwords, payment details, or any form data you enter on AliExpress or any other site; or cookies/session data from AliExpress or any other website. The extension only requests the minimum Chrome permissions needed to detect AliExpress product pages and show the analyze button (activeTab and storage) — it cannot read or modify other websites.',
  },
  {
    title: 'How your data is used',
    body: 'The product URL and title you send are used solely to run the AI analysis you requested — generating a demand score, competition estimate, suggested pricing, ad angles, and related insights — and to display that analysis to you on launchory.io/analyze. We do not sell this data, and we do not share it with third parties except the AI provider we use to generate the analysis itself (OpenAI), strictly to perform that analysis. If you’re signed in to your Launchory account, the analyzed product may also be saved to your account’s history/dashboard so you can find it again later.',
  },
  {
    title: 'Local storage',
    body: 'The extension stores a small amount of data locally in your browser (via chrome.storage.local), not on our servers: the most recently detected product, so the popup can show it instantly, and which products you’ve dismissed the floating button on, so it doesn’t reappear on the same product page. This local data stays on your device and is only cleared when you remove the extension or clear your browser’s extension storage.',
  },
  {
    title: 'Data retention',
    body: 'Analyzed products tied to a signed-in Launchory account are retained for as long as your account is active, so you can revisit past analyses. If you delete your Launchory account, associated analysis history is deleted along with it. Anonymous analyses (when not signed in) are not persisted beyond the single session used to generate the result.',
  },
  {
    title: 'Changes to this policy',
    body: 'If this policy changes, we’ll update the "Last updated" date above. For material changes, we’ll also note it in the extension’s Chrome Web Store listing.',
  },
  {
    title: 'Contact',
    body: 'Questions about this policy or your data? Email us at hello@launchory.io.',
  },
]

export default function ExtensionPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/extension"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Chrome Extension
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Chrome Extension Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-3">Last updated: August 3, 2026</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          This policy covers the Launchory Chrome extension specifically. For the Launchory
          website and account privacy policy, see{' '}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            our main Privacy Policy
          </Link>
          .
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white font-semibold text-lg mb-2">{section.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

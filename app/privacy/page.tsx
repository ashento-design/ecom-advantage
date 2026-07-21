import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "How Launchory collects, uses, and protects your data.",
}

const sections = [
  {
    title: '1. Information We Collect',
    body: 'When you create an account, we collect your name, email address, and password (securely hashed by our authentication provider). We also collect usage data, such as which products you view or analyze, to operate and improve the Service.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and maintain the Service, process payments, enforce usage limits on free accounts, communicate with you about your account, and improve our product research and AI analysis features.',
  },
  {
    title: '3. Payment Information',
    body: 'Subscription payments are processed by Stripe. Launchory does not store your full payment card details — Stripe handles all payment data in accordance with PCI-DSS standards.',
  },
  {
    title: '4. AI Processing',
    body: 'Product titles and descriptions you analyze are sent to our AI provider (OpenAI) to generate demand scores, ad angles, and other insights. We do not send your personal account information as part of these requests.',
  },
  {
    title: '5. Data Sharing',
    body: 'We do not sell your personal information. We share data only with service providers that help us operate Launchory (such as our hosting, database, payment, and AI providers), and only as needed to provide the Service.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain your account information for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.',
  },
  {
    title: '7. Cookies',
    body: 'We use cookies to keep you signed in and to maintain your session. We do not use cookies for third-party advertising.',
  },
  {
    title: '8. Security',
    body: 'We use industry-standard security practices, including encrypted connections and access controls, to protect your data. No system is completely secure, and we encourage you to use a strong, unique password.',
  },
  {
    title: '9. Your Rights',
    body: 'You may access, update, or delete your account information at any time from your account settings, or by contacting us directly.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify users of material changes by posting the updated policy on this page.',
  },
  {
    title: '11. Contact',
    body: 'Questions about this Privacy Policy can be sent to support@launchory.com.',
  },
]

export default function PrivacyPage() {
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
          href="/landing"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 20, 2026</p>

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

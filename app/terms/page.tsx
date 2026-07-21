import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: "Launchory's terms of service for using our AI-powered product research platform.",
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Launchory ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.',
  },
  {
    title: '2. Description of Service',
    body: 'Launchory provides AI-powered product research tools for Shopify dropshippers, including a curated product feed, AI-driven product analysis, and related insights. Product data and AI-generated analysis are provided for informational purposes only and do not constitute business, financial, or legal advice.',
  },
  {
    title: '3. Accounts',
    body: 'You must provide accurate information when creating an account and are responsible for maintaining the confidentiality of your login credentials. You are responsible for all activity that occurs under your account.',
  },
  {
    title: '4. Subscriptions and Billing',
    body: 'Paid plans are billed on a recurring monthly basis through our payment processor, Stripe. Subscriptions automatically renew until cancelled. You may cancel at any time; access to paid features continues until the end of the current billing period. Fees are non-refundable except where required by law.',
  },
  {
    title: '5. Acceptable Use',
    body: 'You agree not to misuse the Service, including but not limited to: attempting to access data not intended for you, interfering with the Service’s operation, or using the Service for any unlawful purpose.',
  },
  {
    title: '6. Intellectual Property',
    body: 'The Service, including its design, code, and branding, is owned by Launchory. Product data displayed through the Service is aggregated from third-party sources and is provided for research purposes only.',
  },
  {
    title: '7. Disclaimer of Warranties',
    body: 'The Service is provided "as is" without warranties of any kind. Launchory does not guarantee the accuracy of demand scores, AI-generated analysis, or any other insights provided through the Service.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the fullest extent permitted by law, Launchory shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including business or financial losses.',
  },
  {
    title: '9. Termination',
    body: 'We reserve the right to suspend or terminate your access to the Service at our discretion, including for violation of these Terms.',
  },
  {
    title: '10. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.',
  },
  {
    title: '11. Contact',
    body: 'Questions about these Terms can be sent to support@launchory.com.',
  },
]

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
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

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analyze Product',
  description: 'Instantly analyze any AliExpress product with Launchory AI — demand score, competition, ad angles, and hooks.',
}

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children
}

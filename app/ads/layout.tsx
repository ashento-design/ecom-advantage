import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Ads',
  description: 'Your AI-generated ad creatives.',
}

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return children
}

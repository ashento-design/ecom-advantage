import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refer & Earn',
  description: 'Refer other dropshippers to Launchory and earn free Pro months.',
}

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children
}

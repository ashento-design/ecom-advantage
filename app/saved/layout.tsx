import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Products',
  description: 'Your bookmarked winning products on Launchory.',
}

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children
}

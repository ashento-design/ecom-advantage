import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request a Product',
  description: 'Suggest a product you want Launchory to research and add to the feed.',
}

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children
}

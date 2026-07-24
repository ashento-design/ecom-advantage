import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Store Intelligence',
  description: "Discover how much any Shopify store is making and steal their winning products.",
}

export default function StoreIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return children
}

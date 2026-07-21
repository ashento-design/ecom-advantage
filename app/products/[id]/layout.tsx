import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Details',
  description: 'AI-powered demand score, competition analysis, and ad angles for this product.',
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}

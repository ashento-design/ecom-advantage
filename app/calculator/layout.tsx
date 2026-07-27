import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profit Calculator',
  description: 'Estimate profit per unit, margin, break-even ROAS, and daily/monthly profit before you spend on ads.',
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}

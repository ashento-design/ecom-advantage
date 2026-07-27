import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Answers to common questions about the AI Analyzer, Ad Generator, Store Intelligence, billing, and your account.',
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}

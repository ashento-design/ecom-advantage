import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your Launchory plan and usage.',
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}

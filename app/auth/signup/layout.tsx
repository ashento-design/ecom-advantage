import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Launchory account and get 3 free AI product analyses.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}

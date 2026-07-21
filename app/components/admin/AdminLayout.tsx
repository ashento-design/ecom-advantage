'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, Rocket, ArrowLeft, LogOut } from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Users', href: '/admin/users', icon: Users },
]

export function AdminLayout({ user, children }: { user: SupabaseUser | null; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 lg:flex">
      <aside className="lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-900/50">
        <div className="lg:sticky lg:top-0 lg:h-screen flex lg:flex-col">
          <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b border-gray-800">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Admin</span>
          </div>

          <nav className="flex lg:flex-col gap-1 px-3 py-3 overflow-x-auto lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600/15 text-emerald-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:block mt-auto p-3 border-t border-gray-800 space-y-1">
            <p className="px-3 py-1 text-xs text-gray-500 truncate">{user?.email}</p>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to app
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8">{children}</main>
    </div>
  )
}

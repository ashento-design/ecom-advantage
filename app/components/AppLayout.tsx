'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Rocket, LayoutDashboard, Bookmark, Image as ImageIcon, Search, PlusCircle,
  Clock, HelpCircle, User, Gift, ChevronsLeft, ChevronsRight, ShieldCheck, LogOut,
  FlaskConical, FolderOpen,
} from 'lucide-react'
import { createBrowserClient } from '@/app/lib/supabase'
import { SearchModal } from '@/app/components/SearchModal'
import { NotificationsDropdown } from '@/app/components/NotificationsDropdown'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const SIDEBAR_COLLAPSED_KEY = 'launchory_sidebar_collapsed'

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; newSince?: string }

// "New" badges auto-expire 30 days after the date a feature shipped,
// rather than staying on forever — keeps the sidebar honest about what's
// actually recent.
const NEW_BADGE_DAYS = 30

function isNewBadgeActive(newSince?: string) {
  if (!newSince) return false
  const elapsedMs = Date.now() - new Date(newSince).getTime()
  return elapsedMs >= 0 && elapsedMs < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000
}

const MAIN_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/saved', label: 'Saved Products', icon: Bookmark },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/ads', label: 'My Ads', icon: ImageIcon },
  { href: '/store-intelligence', label: 'Store Intelligence', icon: Search, newSince: '2026-07-23' },
  { href: '/testing', label: 'Testing Board', icon: FlaskConical, newSince: '2026-07-23' },
  { href: '/request', label: 'Request a Product', icon: PlusCircle },
  { href: '/changelog', label: 'Changelog', icon: Clock },
  { href: '/help', label: 'Help', icon: HelpCircle },
]

const SECONDARY_NAV: NavItem[] = [
  { href: '/account', label: 'Account', icon: User },
  { href: '/referral', label: 'Refer & Earn', icon: Gift },
]

// Calculator now lives inside the Testing Board rather than as its own
// route, so it no longer needs a bottom-tab slot — Store Intelligence
// moves back in as the highest-value paid feature for mobile access.
const MOBILE_TABS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/ads', label: 'My Ads', icon: ImageIcon },
  { href: '/store-intelligence', label: 'Intel', icon: Search },
  { href: '/account', label: 'Account', icon: User },
]

function isNavActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function SidebarLink({ item, active, collapsed, badge }: { item: NavItem; active: boolean; collapsed: boolean; badge?: number }) {
  const Icon = item.icon
  const showNew = isNewBadgeActive(item.newSince)
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium border-l-2 transition-colors ${
        collapsed ? 'justify-center px-0' : 'px-3'
      } ${
        active
          ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500'
          : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && showNew && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full px-1.5 py-0.5">
          New
        </span>
      )}
      {!collapsed && !!badge && badge > 0 && (
        <span className="shrink-0 text-xs font-semibold bg-gray-800 text-gray-300 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {badge}
        </span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-gray-800 border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {item.label}
          {showNew ? ' · New' : ''}
          {!!badge && badge > 0 ? ` (${badge})` : ''}
        </span>
      )}
    </Link>
  )
}

export function AppLayout({ user, children }: { user: SupabaseUser | null; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1') Promise.resolve().then(() => setCollapsed(true))
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      return next
    })
  }

  useEffect(() => {
    if (!user) return
    fetch('/api/admin/check')
      .then((res) => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false))

    const supabase = createBrowserClient()
    supabase
      .from('saved_products')
      .select('product_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setSavedCount(count ?? 0))
  }, [user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col bg-gray-900 border-r border-gray-800 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-[220px]'
        }`}
      >
        <div className={`flex items-center h-16 shrink-0 border-b border-gray-800 ${collapsed ? 'justify-center' : 'justify-end px-3'}`}>
          <button
            onClick={toggleCollapsed}
            className="shrink-0 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg p-2 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {MAIN_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              collapsed={collapsed}
              badge={item.href === '/saved' ? savedCount : undefined}
            />
          ))}

          <div className="my-2 border-t border-gray-800" />

          {SECONDARY_NAV.map((item) => (
            <SidebarLink key={item.href} item={item} active={isNavActive(pathname, item.href)} collapsed={collapsed} />
          ))}
        </nav>
      </aside>

      <div className={`flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'md:pl-16' : 'md:pl-[220px]'}`}>
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Launchory</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
                <span className="hidden sm:inline text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5 ml-0.5">/</span>
              </button>

              <NotificationsDropdown user={user} />

              {user ? (
                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors"
                  >
                    <User size={15} className="text-white" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-gray-800 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShieldCheck size={14} />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-around h-16">
          {MOBILE_TABS.map((item) => {
            const active = isNavActive(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors ${
                  active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

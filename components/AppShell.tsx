'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from './MobileNav'
import { DemoModeBanner } from './DemoModeBanner'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  groupId: string
  groupName?: string
  isAdmin: boolean
  isDemoMode: boolean
}

export function AppShell({ children, groupId, groupName, isAdmin, isDemoMode }: AppShellProps) {
  const pathname = usePathname()
  const base = `/groups/${groupId}`

  const navLinks = [
    { href: `${base}/dashboard`, label: 'Home', emoji: '🏠' },
    { href: `${base}/leaderboard`, label: 'Leaderboard', emoji: '🏆' },
    { href: `${base}/challenges`, label: 'Challenges', emoji: '⚔️' },
    { href: `${base}/rewards`, label: 'Rewards', emoji: '🎁' },
    { href: `${base}/members`, label: 'Members', emoji: '👥' },
    ...(isAdmin ? [{ href: `${base}/admin`, label: 'Admin', emoji: '👑' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {isDemoMode && <DemoModeBanner />}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-purple-900 text-white overflow-y-auto">
          <div className="p-6 border-b border-purple-700">
            <Link href={`${base}/dashboard`} className="flex items-center gap-3">
              <span className="text-3xl">🥋</span>
              <div>
                <p className="font-black text-lg leading-tight">HCWK Dojo</p>
                <p className="text-purple-300 text-xs">{groupName ?? 'Loading...'}</p>
              </div>
            </Link>
          </div>
          <nav className="p-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all',
                  pathname === link.href
                    ? 'bg-purple-700 text-white'
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                )}
              >
                <span className="text-base">{link.emoji}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-purple-700">
            <Link href="/settings" className="flex items-center gap-2 text-purple-300 hover:text-white text-sm font-medium transition-colors">
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-purple-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
          <Link href={`${base}/dashboard`} className="flex items-center gap-2">
            <span className="text-2xl">🥋</span>
            <span className="font-black text-base">HCWK Dojo</span>
          </Link>
          <Link href="/settings" className="text-purple-200 hover:text-white text-xl">⚙️</Link>
        </header>

        <main className="flex-1 p-4 pb-24 lg:pb-8 lg:p-8 max-w-2xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav groupId={groupId} isAdmin={isAdmin} />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from './MobileNav'
import { DemoModeBanner } from './DemoModeBanner'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './ui/Icon'

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

  const navLinks: { href: string; label: string; icon: IconName }[] = [
    { href: `${base}/dashboard`, label: 'Home', icon: 'home' },
    { href: `${base}/leaderboard`, label: 'Leaderboard', icon: 'trophy' },
    { href: `${base}/challenges`, label: 'Challenges', icon: 'target' },
    { href: `${base}/rewards`, label: 'Rewards', icon: 'gift' },
    { href: `${base}/members`, label: 'Members', icon: 'users' },
    ...(isAdmin ? [{ href: `${base}/admin`, label: 'Admin', icon: 'crown' as IconName }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {isDemoMode && <DemoModeBanner />}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-56 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <Link href={`${base}/dashboard`} className="flex items-center gap-3">
              <span className="text-2xl">🥋</span>
              <div>
                <p className="font-bold text-gray-900 leading-tight">HCWK Dojo</p>
                <p className="text-gray-400 text-xs">{groupName ?? 'Loading...'}</p>
              </div>
            </Link>
          </div>
          <nav className="p-3 flex flex-col gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors',
                  pathname === link.href
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <Icon name={link.icon} size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-3 border-t border-gray-100">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
              <Icon name="settings" size={18} /> Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-56 flex flex-col flex-1">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link href={`${base}/dashboard`} className="flex items-center gap-2">
            <span className="text-xl">🥋</span>
            <span className="font-bold text-gray-900">HCWK Dojo</span>
          </Link>
          <Link href="/settings" className="text-gray-400 hover:text-gray-600" aria-label="Settings">
            <Icon name="settings" size={20} />
          </Link>
        </header>

        <main className={cn(
          'flex-1 p-4 pb-24 lg:pb-8 w-full',
          pathname === `${base}/members` ? 'lg:p-0 max-w-none' : 'lg:p-8 max-w-2xl mx-auto'
        )}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav groupId={groupId} isAdmin={isAdmin} />
    </div>
  )
}

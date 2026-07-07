'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from './MobileNav'
import { GroupSwitcher } from './GroupSwitcher'
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

function DojoLogo({ size = 38 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="rounded-xl flex-none">
      <rect width="100" height="100" rx="26" fill="#7C3AED" />
      <circle cx="38" cy="42" r="10" fill="#FFFFFF" />
      <circle cx="40" cy="43" r="4.5" fill="#1F2937" />
      <circle cx="62" cy="42" r="10" fill="#FFFFFF" />
      <circle cx="64" cy="43" r="4.5" fill="#1F2937" />
      <path d="M36 64 Q50 76 64 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function AppShell({ children, groupId, groupName, isAdmin, isDemoMode }: AppShellProps) {
  const pathname = usePathname()
  const base = `/groups/${groupId}`

  const navLinks: { href: string; label: string; icon: IconName }[] = [
    { href: `${base}/dashboard`, label: 'Home', icon: 'home' },
    { href: `${base}/leaderboard`, label: 'Leaderboard', icon: 'trophy' },
    { href: `${base}/members`, label: 'Members', icon: 'users' },
    { href: `${base}/challenges`, label: 'Challenges', icon: 'flag' },
    { href: `${base}/rewards`, label: 'Rewards', icon: 'gift' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {isDemoMode && <DemoModeBanner />}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-[232px] lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-[#F0EDE6] overflow-y-auto px-3.5 pt-5 pb-4 gap-1">
          <GroupSwitcher groupId={groupId} groupName={groupName} logo={<DojoLogo />} />
          <nav className="flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-[11px] rounded-[14px] font-extrabold text-[13.5px] transition-colors',
                  pathname === link.href
                    ? 'bg-primary-soft text-primary'
                    : 'text-[#6B7280] hover:bg-canvas hover:text-body'
                )}
              >
                <Icon name={link.icon} size={20} className="stroke-[2.2]" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          {isAdmin && (
            <Link
              href={`${base}/admin`}
              className={cn(
                'flex items-center gap-3 px-3 py-[11px] rounded-[14px] font-extrabold text-[13.5px] transition-colors',
                pathname === `${base}/admin`
                  ? 'bg-primary-soft text-primary'
                  : 'text-[#6B7280] hover:bg-canvas hover:text-body'
              )}
            >
              <Icon name="shield" size={20} className="stroke-[2.2]" />
              Admin panel
            </Link>
          )}
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-[11px] rounded-[14px] font-extrabold text-[13.5px] text-[#6B7280] hover:bg-canvas hover:text-body transition-colors"
          >
            <Icon name="settings" size={20} className="stroke-[2.2]" />
            Settings
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[232px] flex flex-col flex-1">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-canvas/95 backdrop-blur px-4 py-3 flex items-center justify-between">
          <GroupSwitcher groupId={groupId} groupName={groupName} compact logo={<DojoLogo size={30} />} />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`${base}/admin`}
                aria-label="Admin panel"
                className="w-[38px] h-[38px] rounded-full bg-white shadow-card flex items-center justify-center text-primary active:scale-95 transition-transform"
              >
                <Icon name="shield" size={18} className="stroke-[2.2]" />
              </Link>
            )}
            <Link
              href="/settings"
              aria-label="Settings"
              className="w-[38px] h-[38px] rounded-full bg-white shadow-card flex items-center justify-center text-[#6B7280] active:scale-95 transition-transform"
            >
              <Icon name="settings" size={18} className="stroke-[2.2]" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 pb-28 lg:pb-10 w-full lg:p-8 max-w-[720px] mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav groupId={groupId} isAdmin={isAdmin} />
    </div>
  )
}

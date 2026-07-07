'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './ui/Icon'

interface MobileNavProps {
  groupId: string
  isAdmin: boolean
}

export function MobileNav({ groupId, isAdmin }: MobileNavProps) {
  const pathname = usePathname()
  const base = `/groups/${groupId}`

  const links: { href: string; label: string; icon: IconName }[] = [
    { href: `${base}/dashboard`, label: 'Home', icon: 'home' },
    { href: `${base}/leaderboard`, label: 'Board', icon: 'trophy' },
    { href: `${base}/challenges`, label: 'Quests', icon: 'target' },
    { href: `${base}/rewards`, label: 'Rewards', icon: 'gift' },
    { href: `${base}/members`, label: 'Crew', icon: 'users' },
    ...(isAdmin ? [{ href: `${base}/admin`, label: 'Admin', icon: 'crown' as IconName }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb lg:hidden">
      <div className="flex">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors',
                active ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon name={link.icon} size={22} className={cn(active && 'stroke-[2.4]')} />
              <span className="text-[10px] font-semibold">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

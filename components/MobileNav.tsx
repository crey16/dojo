'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  groupId: string
  isAdmin: boolean
}

export function MobileNav({ groupId, isAdmin }: MobileNavProps) {
  const pathname = usePathname()
  const base = `/groups/${groupId}`

  const links = [
    { href: `${base}/dashboard`, label: 'Home', emoji: '🏠' },
    { href: `${base}/leaderboard`, label: 'Board', emoji: '🏆' },
    { href: `${base}/challenges`, label: 'Quests', emoji: '⚔️' },
    { href: `${base}/rewards`, label: 'Rewards', emoji: '🎁' },
    { href: `${base}/members`, label: 'Crew', emoji: '👥' },
    ...(isAdmin ? [{ href: `${base}/admin`, label: 'Admin', emoji: '👑' }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-purple-100 safe-area-pb lg:hidden">
      <div className="flex">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all',
                active ? 'text-purple-700' : 'text-gray-400 hover:text-purple-500'
              )}
            >
              <span className={cn('text-xl leading-none', active && 'scale-110 transition-transform')}>
                {link.emoji}
              </span>
              <span className={cn('text-[10px] font-bold', active ? 'text-purple-700' : 'text-gray-400')}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './ui/Icon'

interface MobileNavProps {
  groupId: string
  isAdmin: boolean
}

export function MobileNav({ groupId }: MobileNavProps) {
  const pathname = usePathname()
  const base = `/groups/${groupId}`

  const links: { href: string; label: string; icon: IconName }[] = [
    { href: `${base}/dashboard`, label: 'Home', icon: 'home' },
    { href: `${base}/leaderboard`, label: 'Board', icon: 'trophy' },
    { href: `${base}/members`, label: 'Squad', icon: 'users' },
    { href: `${base}/challenges`, label: 'Quests', icon: 'flag' },
    { href: `${base}/rewards`, label: 'Rewards', icon: 'gift' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-nav rounded-t-[20px] safe-area-pb lg:hidden">
      <div className="flex justify-around px-2 pt-2 pb-2.5">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 max-w-[76px] flex flex-col items-center gap-[3px] py-[7px] rounded-2xl transition-all active:scale-90',
                active ? 'bg-primary-soft text-primary' : 'text-muted hover:text-[#6B7280]'
              )}
            >
              <Icon name={link.icon} size={21} className="stroke-[2.2]" />
              <span className="text-[10px] font-black">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserGroups } from '@/lib/data/groups'
import { getCurrentUserId } from '@/lib/data/auth'
import { cn } from '@/lib/utils'
import type { Group } from '@/lib/types'

interface GroupSwitcherProps {
  groupId: string
  groupName?: string
  compact?: boolean
  logo: React.ReactNode
}

// Tappable logo/name block that opens a menu of the user's groups
export function GroupSwitcher({ groupId, groupName, compact, logo }: GroupSwitcherProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getCurrentUserId().then(userId => {
      if (userId) getUserGroups(userId).then(setGroups)
    })
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2.5 rounded-2xl cursor-pointer transition-colors text-left',
          compact ? 'px-1 py-0.5' : 'px-2 pb-4 w-full hover:bg-canvas'
        )}
      >
        {logo}
        <span className="min-w-0">
          <span className={cn('block font-display font-bold leading-none text-ink', compact ? 'text-base' : 'text-lg')}>
            HCWK Dojo
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted mt-0.5">
            <span className="truncate">{groupName ?? 'Holy Chat Without Kaison'}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-none"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute left-0 top-full mt-1 z-50 w-60 bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.14)] p-1.5 animate-pop-in"
          >
            <p className="px-3 pt-2 pb-1 text-[11px] font-extrabold text-muted tracking-wide">MY GROUPS</p>
            {groups.map(group => (
              <Link
                key={group.id}
                href={`/groups/${group.id}/dashboard`}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-extrabold transition-colors',
                  group.id === groupId ? 'bg-primary-soft text-primary' : 'text-body hover:bg-canvas'
                )}
              >
                <span className="truncate flex-1">{group.name}</span>
                {group.id === groupId && <span className="text-xs font-black flex-none">✓</span>}
              </Link>
            ))}
            <div className="border-t border-hairline my-1.5" />
            <Link
              href="/groups/join"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-[13px] font-extrabold text-primary hover:bg-primary-soft transition-colors"
            >
              Join with invite code
            </Link>
            <Link
              href="/groups/create"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-[13px] font-extrabold text-primary hover:bg-primary-soft transition-colors"
            >
              Create a group
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import { AvatarDisc } from './MonsterAvatar'
import type { GroupMember } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RosterMemberCardProps {
  member: GroupMember
  index: number
  points: number
  selected?: boolean
  onClick: () => void
  onQuickAward?: (amount: number) => void
}

export function RosterMemberCard({ member, points, selected, onClick, onQuickAward }: RosterMemberCardProps) {
  const inactive = member.status !== 'active'
  const showQuickAward = onQuickAward && !inactive

  function quickAward(event: React.MouseEvent, amount: number) {
    event.stopPropagation()
    onQuickAward?.(amount)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick() } }}
      className={cn(
        'relative card px-2.5 pt-5 pb-3.5 flex flex-col items-center gap-1.5 text-center cursor-pointer',
        'transition-all hover:shadow-card-hover active:scale-[0.96]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        inactive && 'opacity-50 grayscale',
        selected && 'ring-4 ring-primary/40'
      )}
    >
      {/* floating point bubble */}
      <span className={cn(
        'absolute -top-2.5 -right-1.5 min-w-[34px] h-[34px] rounded-full px-2 border-[3px] border-canvas',
        'inline-flex items-center justify-center text-white font-black text-[13px] tabular-nums shadow-[0_2px_6px_rgba(0,0,0,0.12)] z-10',
        points >= 0 ? 'bg-positive' : 'bg-negative'
      )}>
        {points}
      </span>

      <AvatarDisc
        name={member.avatar_seed || member.display_name}
        size="md"
        mood={points > 10 ? 'happy' : points < 0 ? 'guilty' : 'neutral'}
      />
      <p className="font-black text-sm text-ink max-w-full truncate">{member.display_name}</p>
      <p className={cn('text-[10.5px] font-extrabold', member.role === 'admin' ? 'text-gold-ink' : 'text-muted')}>
        {member.role === 'admin' ? 'Admin' : inactive ? member.status : member.user_id ? 'Claimed' : 'Roster member'}
      </p>

      {showQuickAward && (
        <span className="flex gap-1.5 mt-0.5">
          <button
            type="button"
            aria-label={`Give ${member.display_name} a point`}
            className="w-7 h-7 rounded-full bg-positive-soft text-positive-ink text-sm font-black flex items-center justify-center cursor-pointer transition-transform active:scale-90 leading-none hover:bg-[#BBF7D0]"
            onClick={event => quickAward(event, 1)}
          >+</button>
          <button
            type="button"
            aria-label={`Take a point from ${member.display_name}`}
            className="w-7 h-7 rounded-full bg-negative-soft text-negative-ink text-sm font-black flex items-center justify-center cursor-pointer transition-transform active:scale-90 leading-none hover:bg-[#FECACA]"
            onClick={event => quickAward(event, -1)}
          >−</button>
        </span>
      )}

      {selected && (
        <span className="absolute top-2 left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">✓</span>
      )}
    </div>
  )
}

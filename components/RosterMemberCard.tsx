'use client'

import { MonsterAvatar } from './MonsterAvatar'
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

export function RosterMemberCard({ member, index, points, selected, onClick, onQuickAward }: RosterMemberCardProps) {
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
      className={cn('roster-card', inactive && 'roster-card-inactive', selected && 'roster-card-selected')}
    >
      <span className={cn('roster-points', points < 0 && 'roster-points-negative')}>
        {points}
      </span>
      <MonsterAvatar
        name={member.avatar_seed || member.display_name}
        size="lg"
        mood={points > 10 ? 'happy' : points < 0 ? 'guilty' : 'neutral'}
        className="roster-avatar"
      />
      <div className="min-w-0 text-left">
        <p className="roster-name"><span className="text-gray-400">#{index + 1}.</span> {member.display_name}</p>
        {member.role === 'admin'
          ? <span className="roster-role-badge">👑 Admin</span>
          : <p className="roster-meta">{member.user_id ? 'Claimed' : 'Roster member'}</p>}
      </div>
      {showQuickAward && (
        <span className="roster-quick">
          <button type="button" aria-label={`Give ${member.display_name} a point`} className="roster-quick-btn roster-quick-plus" onClick={event => quickAward(event, 1)}>+</button>
          <button type="button" aria-label={`Take a point from ${member.display_name}`} className="roster-quick-btn roster-quick-minus" onClick={event => quickAward(event, -1)}>−</button>
        </span>
      )}
      {inactive && <span className="roster-status">{member.status}</span>}
      {selected && <span className="roster-selected-check">✓</span>}
    </div>
  )
}

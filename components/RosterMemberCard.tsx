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
}

export function RosterMemberCard({ member, index, points, selected, onClick }: RosterMemberCardProps) {
  const inactive = member.status !== 'active'

  return (
    <button
      onClick={onClick}
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
        <p className="roster-meta">{member.role === 'admin' ? 'Admin' : member.user_id ? 'Claimed' : 'Roster member'}</p>
      </div>
      {inactive && <span className="roster-status">{member.status}</span>}
      {selected && <span className="roster-selected-check">✓</span>}
    </button>
  )
}

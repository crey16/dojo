import Link from 'next/link'
import { MonsterAvatar } from './MonsterAvatar'
import { Badge } from './ui/Badge'
import type { GroupMember } from '@/lib/types'

interface MemberCardProps {
  member: GroupMember
  groupId: string
  points?: number
  rank?: number
}

export function MemberCard({ member, groupId, points, rank }: MemberCardProps) {
  const name = member.profile?.display_name ?? 'Unknown'

  return (
    <Link href={`/groups/${groupId}/members/${member.user_id}`}>
      <div className="bg-white rounded-2xl border-2 border-purple-100 p-3 flex items-center gap-3 hover:border-purple-300 transition-all active:scale-95">
        <MonsterAvatar name={name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-800 truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {member.role === 'admin' && <Badge variant="purple">👑 Admin</Badge>}
            {rank && <Badge variant="yellow">#{rank}</Badge>}
          </div>
        </div>
        {points !== undefined && (
          <span className={`text-base font-black ${points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {points >= 0 ? '+' : ''}{points}
          </span>
        )}
      </div>
    </Link>
  )
}

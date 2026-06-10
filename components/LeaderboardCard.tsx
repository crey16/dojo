import { MonsterAvatar } from './MonsterAvatar'
import { getRankLabel, getRankBg } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

export function LeaderboardCard({ entry, isCurrentUser }: LeaderboardCardProps) {
  const isTop3 = entry.rank <= 3

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-2xl border-2 transition-all',
      isCurrentUser
        ? 'bg-purple-100 border-purple-400 shadow-md'
        : 'bg-white border-purple-100',
      isTop3 && !isCurrentUser && 'border-yellow-200 bg-yellow-50'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0',
        getRankBg(entry.rank)
      )}>
        {entry.rank === 1 ? '👑' : entry.rank}
      </div>

      <MonsterAvatar
        name={entry.display_name}
        size="sm"
        mood={entry.total_points > 0 ? 'happy' : entry.total_points < 0 ? 'guilty' : 'neutral'}
      />

      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-sm truncate', isCurrentUser ? 'text-purple-800' : 'text-gray-800')}>
          {entry.display_name}
          {isCurrentUser && <span className="ml-1 text-xs font-normal text-purple-500">(you)</span>}
        </p>
        <p className="text-xs text-gray-400">{getRankLabel(entry.rank)}</p>
      </div>

      <span className={cn(
        'text-xl font-black tabular-nums',
        entry.total_points > 0 ? 'text-green-600' : entry.total_points < 0 ? 'text-red-500' : 'text-gray-400'
      )}>
        {entry.total_points > 0 ? '+' : ''}{entry.total_points}
      </span>
    </div>
  )
}

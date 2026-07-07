import { AvatarDisc } from './MonsterAvatar'
import { PointBubble } from './PointBubble'
import type { LeaderboardEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

export function LeaderboardCard({ entry, isCurrentUser }: LeaderboardCardProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 py-3 border-b border-hairline last:border-0',
      isCurrentUser && '-mx-3 px-3 bg-primary-soft/60 rounded-2xl border-transparent'
    )}>
      <span className="w-7 font-black text-[13px] text-muted tabular-nums flex-none">{entry.rank}</span>
      <AvatarDisc name={entry.display_name} size="xs" />
      <p className="flex-1 min-w-0 font-extrabold text-sm text-ink truncate">
        {entry.display_name}
        {isCurrentUser && <span className="ml-1.5 text-xs font-bold text-primary">you</span>}
      </p>
      <PointBubble points={entry.total_points} showSign />
    </div>
  )
}

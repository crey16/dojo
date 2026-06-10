import { MonsterAvatar } from './MonsterAvatar'
import { formatRelativeTime } from '@/lib/utils'
import type { PointEvent } from '@/lib/types'

interface ActivityItemProps {
  event: PointEvent
}

export function ActivityItem({ event }: ActivityItemProps) {
  const positive = event.amount > 0
  const name = event.profile?.display_name ?? 'Unknown'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-purple-100 last:border-0">
      <MonsterAvatar name={name} size="sm" mood={positive ? 'happy' : 'guilty'} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-800 truncate">
          {name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {event.category?.emoji} {event.reason}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={`text-sm font-black ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? '+' : ''}{event.amount}
        </span>
        <span className="text-xs text-gray-400">{formatRelativeTime(event.created_at)}</span>
      </div>
    </div>
  )
}

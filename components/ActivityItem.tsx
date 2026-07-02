import { MonsterAvatar } from './MonsterAvatar'
import { formatRelativeTime } from '@/lib/utils'
import type { PointEvent } from '@/lib/types'

interface ActivityItemProps {
  event: PointEvent
  onUndo?: () => void
}

export function ActivityItem({ event, onUndo }: ActivityItemProps) {
  const positive = event.amount > 0
  const name = event.member?.display_name ?? 'Unknown'

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
      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          title="Undo this point event"
          className="text-xs font-bold text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg px-2 py-1 cursor-pointer"
        >
          ↩ Undo
        </button>
      )}
    </div>
  )
}

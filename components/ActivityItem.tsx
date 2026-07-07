import { AvatarDisc } from './MonsterAvatar'
import { PointBubble } from './PointBubble'
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
    <div className="flex items-center gap-3 py-3 border-b border-hairline last:border-0">
      <AvatarDisc name={event.member?.avatar_seed || name} size="xs" mood={positive ? 'happy' : 'guilty'} />
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[13.5px] text-ink truncate">
          {name}{event.reason ? ` · ${event.reason}` : ''}
        </p>
        <p className="text-[11.5px] font-bold text-muted">{formatRelativeTime(event.created_at)}</p>
      </div>
      <PointBubble points={event.amount} showSign />
      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          title="Undo this point event"
          className="text-xs font-black text-primary hover:text-primary-dark hover:bg-primary-soft rounded-full px-2.5 py-1 cursor-pointer"
        >
          Undo
        </button>
      )}
    </div>
  )
}

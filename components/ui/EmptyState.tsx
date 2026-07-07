import { MonsterAvatar } from '../MonsterAvatar'

interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
      <MonsterAvatar name="Nobody Yet" size="md" mood="guilty" className="opacity-85" />
      <h3 className="text-[13px] font-extrabold text-[#6B7280]">{title}</h3>
      {description && <p className="text-xs font-bold text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

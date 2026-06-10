interface AdminActionCardProps {
  title: string
  description: string
  emoji: string
  color?: string
  children?: React.ReactNode
}

export function AdminActionCard({ title, description, emoji, color = 'bg-purple-50 border-purple-200', children }: AdminActionCardProps) {
  return (
    <div className={`rounded-3xl border-2 p-4 flex flex-col gap-3 ${color}`}>
      <div>
        <h3 className="font-black text-base text-gray-800 flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

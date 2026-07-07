interface AdminActionCardProps {
  title: string
  description: string
  emoji?: string
  color?: string
  children?: React.ReactNode
}

export function AdminActionCard({ title, description, children }: AdminActionCardProps) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-display font-bold text-base text-ink">{title}</h3>
        <p className="text-xs font-bold text-muted mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

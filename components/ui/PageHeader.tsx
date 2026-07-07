interface PageHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display font-bold text-[28px] leading-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] font-bold text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

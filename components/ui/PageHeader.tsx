interface PageHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, emoji, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-black text-purple-900 flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-sm text-purple-600 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

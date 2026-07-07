interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
}

export function EmptyState({ emoji = '🫙', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4 animate-float">{emoji}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-1.5">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}

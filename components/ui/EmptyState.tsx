interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
}

export function EmptyState({ emoji = '🫙', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4 animate-float">{emoji}</div>
      <h3 className="text-xl font-bold text-purple-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}

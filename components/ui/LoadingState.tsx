interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex gap-2">
        {['bg-purple-400', 'bg-pink-400', 'bg-yellow-400'].map((color, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${color} animate-bounce`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm font-bold text-purple-600">{message}</p>
    </div>
  )
}

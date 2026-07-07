interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex gap-2">
        {['bg-primary', 'bg-[#C4B5FD]', 'bg-primary-soft'].map((color, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${color} animate-bounce`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-[13px] font-extrabold text-muted">{message}</p>
    </div>
  )
}

import { cn } from '@/lib/utils'

interface PointBubbleProps {
  points: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSign?: boolean
}

export function PointBubble({ points, size = 'md', showSign = false }: PointBubbleProps) {
  const positive = points >= 0

  const sizes = {
    sm: 'text-sm px-2.5 py-1 min-w-[2.5rem]',
    md: 'text-base px-3 py-1.5 min-w-[3.5rem]',
    lg: 'text-2xl px-5 py-2 min-w-[5rem]',
    xl: 'text-4xl px-7 py-3 min-w-[7rem]',
  }

  const display = showSign && positive ? `+${points}` : `${points}`

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full font-black border-b-4 shadow-sm',
      positive
        ? 'bg-green-400 text-white border-green-600'
        : 'bg-red-400 text-white border-red-600',
      sizes[size]
    )}>
      {display}
    </span>
  )
}

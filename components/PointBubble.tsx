import { cn } from '@/lib/utils'

interface PointBubbleProps {
  points: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSign?: boolean
}

// The one point-chip component: green +N / red −N pill (spec: chipStyle)
export function PointBubble({ points, size = 'md', showSign = false }: PointBubbleProps) {
  const positive = points >= 0

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-[13px] px-3 py-1',
    lg: 'text-base px-4 py-1.5',
    xl: 'text-2xl px-5 py-2',
  }

  const display = positive
    ? `${showSign ? '+' : ''}${points}`
    : `−${Math.abs(points)}`

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full font-black tabular-nums flex-none',
      positive
        ? 'bg-positive-soft text-positive-ink'
        : 'bg-negative-soft text-negative-ink',
      sizes[size]
    )}>
      {display}
    </span>
  )
}

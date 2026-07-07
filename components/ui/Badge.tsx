import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'purple', className }: BadgeProps) {
  const variants = {
    purple: 'bg-primary-soft text-primary-dark',
    green: 'bg-positive-soft text-positive-ink',
    red: 'bg-negative-soft text-negative-ink',
    yellow: 'bg-gold-soft text-gold-ink',
    blue: 'bg-[#DBEAFE] text-[#1D4ED8]',
    gray: 'bg-shell text-[#6B7280]',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-black tabular-nums',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

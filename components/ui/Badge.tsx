import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'purple', className }: BadgeProps) {
  const variants = {
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    gray: 'bg-gray-100 text-gray-600 ring-gray-200',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

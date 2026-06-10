import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'purple', className }: BadgeProps) {
  const variants = {
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    gray: 'bg-gray-100 text-gray-600 border-gray-300',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

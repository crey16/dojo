import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  emoji?: string
  color?: 'purple' | 'pink' | 'green' | 'yellow' | 'blue' | 'red'
  subtitle?: string
}

const colors = {
  purple: 'bg-purple-100 border-purple-300 text-purple-800',
  pink: 'bg-pink-100 border-pink-300 text-pink-800',
  green: 'bg-green-100 border-green-300 text-green-800',
  yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  blue: 'bg-blue-100 border-blue-300 text-blue-800',
  red: 'bg-red-100 border-red-300 text-red-800',
}

export function StatCard({ title, value, emoji, color = 'purple', subtitle }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border-2 p-4 flex flex-col gap-1', colors[color])}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{emoji} {title}</p>
      <p className="text-3xl font-black">{value}</p>
      {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
    </div>
  )
}

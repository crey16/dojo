import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  emoji?: string
  color?: 'purple' | 'pink' | 'green' | 'yellow' | 'blue' | 'red'
  subtitle?: string
}

const valueColors = {
  purple: 'text-primary',
  pink: 'text-[#DB2777]',
  green: 'text-positive',
  yellow: 'text-gold',
  blue: 'text-[#3B82F6]',
  red: 'text-negative',
}

export function StatCard({ title, value, color = 'purple', subtitle }: StatCardProps) {
  return (
    <div className="card p-3 text-center flex flex-col gap-0.5">
      <p className={cn('font-display font-bold text-[22px] leading-tight tabular-nums', valueColors[color])}>{value}</p>
      <p className="text-[11px] font-extrabold text-muted">{title}</p>
      {subtitle && <p className="text-[10px] font-bold text-muted">{subtitle}</p>}
    </div>
  )
}

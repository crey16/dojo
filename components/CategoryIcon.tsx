import { Icon, type IconName } from './ui/Icon'
import { hashString } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CategoryIconProps {
  name: string
  positive: boolean
  size?: number
  className?: string
}

// Keyword → icon for the default categories; custom categories fall back to a
// deterministic pick from the matching pool (same name → same icon).
const KEYWORDS: Array<[RegExp, IconName]> = [
  [/carr|chat|fire|streak/i, 'flame'],
  [/plan|hangout|date|meet/i, 'calendar'],
  [/funny|joke|meme|laugh/i, 'laugh'],
  [/help|kind|assist|support/i, 'heart'],
  [/clutch|save|win/i, 'zap'],
  [/dry|boring|bland/i, 'meh'],
  [/flake|bail|cancel/i, 'feather'],
  [/take|opinion|bad/i, 'thumbs-down'],
  [/ghost|ignore|read/i, 'ghost'],
  [/unholy|cursed|evil|chaos/i, 'skull'],
]

const POSITIVE_POOL: IconName[] = ['flame', 'calendar', 'laugh', 'heart', 'zap', 'star']
const NEGATIVE_POOL: IconName[] = ['meh', 'feather', 'thumbs-down', 'ghost', 'skull']

export function categoryIconName(name: string, positive: boolean): IconName {
  for (const [pattern, icon] of KEYWORDS) {
    if (pattern.test(name)) return icon
  }
  const pool = positive ? POSITIVE_POOL : NEGATIVE_POOL
  return pool[hashString(name) % pool.length]
}

export function CategoryIcon({ name, positive, size = 18, className }: CategoryIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full w-8 h-8 flex-none',
        positive ? 'bg-positive-soft text-positive-ink' : 'bg-negative-soft text-negative-ink',
        className
      )}
    >
      <Icon name={categoryIconName(name, positive)} size={size} className="stroke-[2.2]" />
    </span>
  )
}

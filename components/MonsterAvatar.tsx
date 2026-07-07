import { hashString } from '@/lib/utils'
import type { AvatarMood } from '@/lib/types'

interface MonsterAvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  mood?: AvatarMood
  className?: string
}

const BODY_COLORS = ['#7C3AED', '#EC4899', '#F97316', '#22C55E', '#3B82F6', '#EAB308', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
const TINTS = ['#EDE9FE', '#FCE7F3', '#FFEDD5', '#DCFCE7', '#DBEAFE', '#FEF9C3', '#FEE2E2', '#F5F3FF', '#CFFAFE', '#ECFCCB']

const SIZES: Record<string, number> = { xs: 32, sm: 48, md: 64, lg: 96, xl: 128 }

/** Pastel background tint matching a member's monster. Deterministic: same name → same tint. */
export function monsterTint(name: string): string {
  return TINTS[hashString(name) % TINTS.length]
}

// Mood nudges the mouth: happy → smile/grin, guilty → flat, chaotic → teeth, neutral → hash-picked
function mouthVariant(hash: number, mood: AvatarMood): number {
  if (mood === 'happy') return hash % 2 === 0 ? 0 : 2
  if (mood === 'guilty') return 3
  if (mood === 'chaotic') return 2
  return (hash >>> 9) % 3
}

const DISC_SIZES: Record<string, { disc: number; avatar: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }> = {
  xs: { disc: 40, avatar: 'xs' },
  sm: { disc: 52, avatar: 'sm' },
  md: { disc: 72, avatar: 'md' },
  lg: { disc: 112, avatar: 'lg' },
  xl: { disc: 148, avatar: 'xl' },
}

/** Monster sitting on its soft pastel circle — the standard avatar treatment. */
export function AvatarDisc({ name, size = 'md', mood, className = '', float = false }: MonsterAvatarProps & { float?: boolean }) {
  const s = DISC_SIZES[size] ?? DISC_SIZES.md
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full flex-shrink-0 ${float ? 'animate-floaty' : ''} ${className}`}
      style={{ width: s.disc, height: s.disc, backgroundColor: monsterTint(name) }}
    >
      <MonsterAvatar name={name} size={s.avatar} mood={mood} />
    </span>
  )
}

export function MonsterAvatar({ name, size = 'md', mood = 'neutral', className = '' }: MonsterAvatarProps) {
  const hash = hashString(name)
  const c = BODY_COLORS[hash % BODY_COLORS.length]
  const shape = (hash >>> 3) % 3
  const eyes = (hash >>> 5) % 3
  const top = (hash >>> 7) % 4
  const mouthV = mouthVariant(hash, mood)
  const dk = 'rgba(0,0,0,0.14)'
  const px = SIZES[size] ?? SIZES.md

  const eye = (x: number, y: number, r: number) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={r} fill="#FFFFFF" />
      <circle cx={x + r * 0.15} cy={y + r * 0.1} r={r * 0.45} fill="#1F2937" />
      <circle cx={x + r * 0.02} cy={y - r * 0.18} r={r * 0.15} fill="#FFFFFF" />
    </g>
  )

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: px, height: px }}
      title={name}
    >
      <svg viewBox="0 0 100 100" width={px} height={px} aria-hidden="true">
        {/* top features (behind body) */}
        {top === 1 && (
          <>
            <path d="M32 30 L26 12 L42 22 Z" fill={c} stroke={dk} strokeWidth="2" />
            <path d="M68 30 L74 12 L58 22 Z" fill={c} stroke={dk} strokeWidth="2" />
          </>
        )}
        {top === 2 && (
          <>
            <line x1="50" y1="26" x2="50" y2="10" stroke={c} strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="9" r="5.5" fill={c} stroke={dk} strokeWidth="2" />
          </>
        )}
        {top === 3 && (
          <>
            <circle cx="30" cy="24" r="10" fill={c} stroke={dk} strokeWidth="2" />
            <circle cx="70" cy="24" r="10" fill={c} stroke={dk} strokeWidth="2" />
          </>
        )}
        {/* feet */}
        <ellipse cx="38" cy="94" rx="9" ry="5" fill={c} stroke={dk} strokeWidth="2" />
        <ellipse cx="62" cy="94" rx="9" ry="5" fill={c} stroke={dk} strokeWidth="2" />
        {/* body */}
        {shape === 0 && <ellipse cx="50" cy="58" rx="33" ry="37" fill={c} />}
        {shape === 1 && <rect x="17" y="22" width="66" height="72" rx="30" fill={c} />}
        {shape === 2 && <circle cx="50" cy="58" r="36" fill={c} />}
        {/* belly */}
        <ellipse cx="50" cy="74" rx="17" ry="12" fill="#FFFFFF" opacity="0.32" />
        {/* eyes */}
        {eyes === 0 && eye(50, 48, 12)}
        {eyes === 1 && [eye(41, 48, 8), eye(59, 48, 8)]}
        {eyes === 2 && [eye(36, 48, 7.5), eye(64, 48, 7.5)]}
        {/* mouth */}
        {mouthV === 0 && <path d="M40 64 Q50 72 60 64" fill="none" stroke="#1F2937" strokeWidth="3.4" strokeLinecap="round" />}
        {mouthV === 1 && (
          <>
            <ellipse cx="50" cy="66" rx="8" ry="6" fill="#1F2937" />
            <ellipse cx="50" cy="69" rx="4.5" ry="2.6" fill="#F87171" />
          </>
        )}
        {mouthV === 2 && (
          <>
            <path d="M38 63 Q50 73 62 63 L62 64 Q50 76 38 64 Z" fill="#1F2937" />
            <rect x="43" y="63.5" width="5" height="4" rx="1" fill="#FFFFFF" />
            <rect x="52" y="63.5" width="5" height="4" rx="1" fill="#FFFFFF" />
          </>
        )}
        {mouthV === 3 && <path d="M41 66 Q50 63 59 66" fill="none" stroke="#1F2937" strokeWidth="3.4" strokeLinecap="round" />}
      </svg>
    </span>
  )
}

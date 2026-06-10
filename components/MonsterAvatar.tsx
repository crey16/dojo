import { hashString } from '@/lib/utils'
import type { AvatarMood } from '@/lib/types'

interface MonsterAvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  mood?: AvatarMood
  className?: string
}

const BODY_COLORS = ['#7c3aed', '#ec4899', '#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
const BELLY_COLORS = ['#ede9fe', '#fce7f3', '#ffedd5', '#dcfce7', '#dbeafe', '#fef9c3', '#fee2e2', '#f5f3ff', '#cffafe', '#ecfccb']

const EYES = ['👀', '😍', '🤪', '😤', '🥲', '😵', '🤩', '😈', '👁️', '🫣']

const MOUTHS_HAPPY = ['😄', '😁', '🤣', '😊', '😆']
const MOUTHS_NEUTRAL = ['😐', '🫤', '😶', '😑']
const MOUTHS_GUILTY = ['😬', '😅', '🫠', '😨']
const MOUTHS_CHAOTIC = ['😈', '🤪', '😤', '😡', '🤯']

const ACCESSORIES = ['🎩', '👑', '🎀', '🤠', '🪖', '', '', '', '', '']
const HORNS = ['🦄', '', '', '', '', '', '', '']

function getMouthSet(mood: AvatarMood) {
  switch (mood) {
    case 'happy': return MOUTHS_HAPPY
    case 'guilty': return MOUTHS_GUILTY
    case 'chaotic': return MOUTHS_CHAOTIC
    default: return MOUTHS_NEUTRAL
  }
}

const SIZES: Record<string, { container: string; font: string; blob: number }> = {
  xs: { container: 'w-8 h-8', font: 'text-xs', blob: 32 },
  sm: { container: 'w-12 h-12', font: 'text-sm', blob: 48 },
  md: { container: 'w-16 h-16', font: 'text-xl', blob: 64 },
  lg: { container: 'w-24 h-24', font: 'text-3xl', blob: 96 },
  xl: { container: 'w-32 h-32', font: 'text-5xl', blob: 128 },
}

export function MonsterAvatar({ name, size = 'md', mood = 'neutral', className = '' }: MonsterAvatarProps) {
  const hash = hashString(name)
  const bodyColor = BODY_COLORS[hash % BODY_COLORS.length]
  const bellyColor = BELLY_COLORS[hash % BELLY_COLORS.length]
  const eyeEmoji = EYES[(hash * 3) % EYES.length]
  const mouthSet = getMouthSet(mood)
  const mouth = mouthSet[(hash * 7) % mouthSet.length]
  const accessory = ACCESSORIES[(hash * 5) % ACCESSORIES.length]
  const horn = HORNS[(hash * 11) % HORNS.length]

  const s = SIZES[size] ?? SIZES.md
  const r = s.blob / 2

  const blobPath = `M ${r},${r*0.3} C ${r*1.4},${r*0.1} ${r*1.8},${r*0.8} ${r*1.7},${r*1.3} C ${r*1.6},${r*1.8} ${r*1.1},${r*1.9} ${r*0.6},${r*1.8} C ${r*0.1},${r*1.7} ${r*-0.1},${r*1.1} ${r*0.1},${r*0.7} C ${r*0.2},${r*0.3} ${r*0.7},${r*0.4} ${r},${r*0.3} Z`

  const faceSize = Math.round(s.blob * 0.55)
  const faceX = (s.blob - faceSize) / 2
  const faceY = s.blob * 0.28
  const faceRx = faceSize * 0.45
  const faceRy = faceSize * 0.35

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${s.container} ${className}`} title={name}>
      <svg
        viewBox={`0 0 ${s.blob} ${s.blob}`}
        width={s.blob}
        height={s.blob}
        style={{ overflow: 'visible' }}
      >
        {/* Body blob */}
        <path d={blobPath} fill={bodyColor} />
        {/* Belly */}
        <ellipse cx={r} cy={r * 1.2} rx={r * 0.45} ry={r * 0.35} fill={bellyColor} opacity={0.7} />
      </svg>

      {/* Face layer on top */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingTop: `${s.blob * 0.12}px` }}
      >
        {accessory && <span className={`${s.font} leading-none`} style={{ fontSize: s.blob * 0.22 }}>{accessory}</span>}
        <span style={{ fontSize: s.blob * 0.22 }}>{horn}</span>
        <div className="flex items-center gap-0.5" style={{ fontSize: s.blob * 0.18 }}>
          {eyeEmoji}
        </div>
        <span style={{ fontSize: s.blob * 0.18 }}>{mouth}</span>
      </div>
    </div>
  )
}

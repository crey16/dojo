'use client'

import { Icon } from './ui/Icon'
import { hashString } from '@/lib/utils'
import type { Reward } from '@/lib/types'

interface RewardCardProps {
  reward: Reward
  userPoints: number
  isAdmin: boolean
  onRedeem?: (reward: Reward) => void
}

const ICON_STYLES = [
  { bg: '#EDE9FE', color: '#7C3AED' },
  { bg: '#FFEDD5', color: '#EA580C' },
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#FCE7F3', color: '#DB2777' },
  { bg: '#DCFCE7', color: '#15803D' },
]

export function RewardCard({ reward, userPoints, isAdmin, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.cost
  const iconStyle = ICON_STYLES[hashString(reward.title) % ICON_STYLES.length]

  return (
    <div className="card p-4 flex items-center gap-3.5">
      <span
        className="w-12 h-12 rounded-2xl inline-flex items-center justify-center flex-none"
        style={{ backgroundColor: iconStyle.bg, color: iconStyle.color }}
      >
        <Icon name="gift" size={22} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-black text-[14.5px] text-ink">{reward.title}</span>
        {reward.description && (
          <span className="block text-xs font-bold text-[#6B7280] mt-0.5 leading-relaxed">{reward.description}</span>
        )}
      </span>
      {isAdmin ? (
        <span className="bg-primary-soft text-primary-dark rounded-full px-3.5 py-2 font-black text-[13px] tabular-nums flex-none">
          {reward.cost} pts
        </span>
      ) : (
        <button
          type="button"
          disabled={!canAfford || !onRedeem}
          onClick={() => onRedeem?.(reward)}
          title={canAfford ? `Redeem for ${reward.cost} points` : `Needs ${reward.cost - userPoints} more points`}
          className={
            canAfford
              ? 'bg-primary text-white rounded-full px-4 py-2.5 font-black text-[13px] tabular-nums flex-none btn-edge active:translate-y-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              : 'bg-shell text-[#B0AA9E] rounded-full px-4 py-2.5 font-black text-[13px] tabular-nums flex-none cursor-not-allowed'
          }
        >
          {reward.cost} pts
        </button>
      )}
    </div>
  )
}

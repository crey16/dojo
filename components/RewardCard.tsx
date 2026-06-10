'use client'

import { Button } from './ui/Button'
import type { Reward } from '@/lib/types'

interface RewardCardProps {
  reward: Reward
  userPoints: number
  isAdmin: boolean
  onRedeem?: (reward: Reward) => void
}

export function RewardCard({ reward, userPoints, isAdmin, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.cost

  return (
    <div className="bg-white rounded-3xl border-2 border-purple-100 p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-black text-base text-gray-800">{reward.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
        </div>
        <div className="flex-shrink-0 bg-yellow-400 text-yellow-900 rounded-2xl px-3 py-1.5 text-sm font-black border-b-4 border-yellow-600">
          ⭐ {reward.cost} pts
        </div>
      </div>

      {!isAdmin && onRedeem && (
        <Button
          variant={canAfford ? 'success' : 'secondary'}
          size="sm"
          disabled={!canAfford}
          onClick={() => onRedeem(reward)}
          className="w-full"
        >
          {canAfford ? '🎉 Redeem!' : `Need ${reward.cost - userPoints} more pts`}
        </Button>
      )}

      {isAdmin && (
        <span className="text-xs text-center text-gray-400 font-medium">Admin — manage in admin panel</span>
      )}
    </div>
  )
}

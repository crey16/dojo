'use client'

import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Challenge } from '@/lib/types'

interface ChallengeCardProps {
  challenge: Challenge
  isAdmin: boolean
  hasSubmitted?: boolean
  onSubmit?: (challenge: Challenge) => void
}

export function ChallengeCard({ challenge, isAdmin, hasSubmitted, onSubmit }: ChallengeCardProps) {
  const isExpired = challenge.due_date && new Date(challenge.due_date) < new Date()

  return (
    <div className="bg-white rounded-3xl border-2 border-purple-100 p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start gap-2 justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base text-gray-800">{challenge.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{challenge.description}</p>
        </div>
        <div className="flex-shrink-0 bg-purple-100 text-purple-700 rounded-2xl px-3 py-1.5 text-sm font-black border border-purple-200">
          ✨ {challenge.points} pts
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!challenge.active && <Badge variant="gray">Inactive</Badge>}
        {challenge.due_date && (
          <Badge variant={isExpired ? 'red' : 'blue'}>
            {isExpired ? '⏰ Expired' : `📅 Due ${formatDate(challenge.due_date)}`}
          </Badge>
        )}
        {hasSubmitted && <Badge variant="green">✅ Submitted</Badge>}
      </div>

      {!isAdmin && challenge.active && !isExpired && onSubmit && (
        <Button
          variant={hasSubmitted ? 'ghost' : 'primary'}
          size="sm"
          disabled={hasSubmitted}
          onClick={() => onSubmit(challenge)}
          className="w-full"
        >
          {hasSubmitted ? '✅ Already submitted' : '🚀 Submit Challenge'}
        </Button>
      )}

      {isAdmin && (
        <span className="text-xs text-center text-gray-400 font-medium">Admin — manage in admin panel</span>
      )}
    </div>
  )
}

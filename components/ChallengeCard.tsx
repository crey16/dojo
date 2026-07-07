'use client'

import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { PointBubble } from './PointBubble'
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
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[15px] text-ink">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-[12.5px] font-bold text-[#6B7280] mt-0.5 leading-relaxed">{challenge.description}</p>
          )}
        </div>
        <PointBubble points={challenge.points} showSign />
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[11.5px] font-extrabold text-muted flex-1">
          {challenge.due_date
            ? isExpired ? 'Expired' : `Ends ${formatDate(challenge.due_date)}`
            : challenge.active ? 'No deadline' : ''}
        </span>
        {!challenge.active && <Badge variant="gray">Inactive</Badge>}
        {isAdmin ? (
          <span className="text-[11.5px] font-bold text-muted">Manage in admin panel</span>
        ) : challenge.active && !isExpired && onSubmit ? (
          hasSubmitted ? (
            <span className="bg-positive-soft text-positive-ink rounded-full px-4 py-2 font-black text-[13px]">Submitted ✓</span>
          ) : (
            <Button size="sm" onClick={() => onSubmit(challenge)}>Submit proof</Button>
          )
        ) : hasSubmitted ? (
          <Badge variant="green">Submitted</Badge>
        ) : null}
      </div>
    </div>
  )
}

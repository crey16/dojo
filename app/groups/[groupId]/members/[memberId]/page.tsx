'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AvatarDisc } from '@/components/MonsterAvatar'
import { ActivityItem } from '@/components/ActivityItem'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { getGroupMembers } from '@/lib/data/members'
import { getMemberPointEvents, getMemberTotalPoints, getLeaderboard } from '@/lib/data/points'
import type { GroupMember, PointEvent } from '@/lib/types'

export default function MemberProfilePage() {
  const params = useParams()
  const groupId = params.groupId as string
  const memberId = params.memberId as string

  const [member, setMember] = useState<GroupMember | null>(null)
  const [events, setEvents] = useState<PointEvent[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [rank, setRank] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [members, pointEvents, total, leaderboard] = await Promise.all([
        getGroupMembers(groupId),
        getMemberPointEvents(groupId, memberId),
        getMemberTotalPoints(groupId, memberId),
        getLeaderboard(groupId, 'all-time'),
      ])
      const found = members.find(m => m.id === memberId)
      setMember(found ?? null)
      setEvents(pointEvents)
      setTotalPoints(total)
      const entry = leaderboard.find(e => e.member_id === memberId)
      setRank(entry?.rank ?? 0)
      setLoading(false)
    }
    load()
  }, [groupId, memberId])

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  const weeklyPoints = events
    .filter(e => new Date(e.created_at) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0)

  const name = member?.display_name ?? 'Unknown'
  const mood = totalPoints > 10 ? 'happy' : totalPoints < 0 ? 'guilty' : 'neutral'

  if (loading) return <LoadingState />
  if (!member) {
    return (
      <div className="card mt-8">
        <EmptyState
          title="Member not found"
          description="They may have been removed from the roster."
          action={
            <Link href={`/groups/${groupId}/members`} className="text-[13px] font-black text-primary hover:text-primary-dark">
              Back to the squad
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Link
        href={`/groups/${groupId}/members`}
        aria-label="Back to members"
        className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-body active:scale-90 transition-transform"
      >
        <Icon name="back" size={20} className="stroke-[2.4]" />
      </Link>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mt-1">
        <AvatarDisc name={member.avatar_seed || name} size="lg" mood={mood} float className="shadow-[0_4px_14px_rgba(0,0,0,0.08)]" />
        <h1 className="font-display font-bold text-[26px] text-ink mt-3">{name}</h1>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          <Badge variant="purple">{totalPoints} pts</Badge>
          {rank > 0 && <Badge variant="yellow">Rank #{rank}</Badge>}
          {member.role === 'admin' && <Badge variant="blue">Admin</Badge>}
        </div>
      </div>

      {/* Week summary tiles */}
      <div className="flex gap-2.5 mt-5">
        <div className="flex-1 card px-2 py-3 text-center">
          <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1.5 ${weeklyPoints >= 0 ? 'bg-positive' : 'bg-negative'}`} />
          <p className="text-[11px] font-black text-body leading-snug">
            {weeklyPoints >= 0 ? '+' : '−'}{Math.abs(weeklyPoints)} this week
          </p>
        </div>
        <div className="flex-1 card px-2 py-3 text-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto mb-1.5" />
          <p className="text-[11px] font-black text-body leading-snug">
            {rank > 0 && rank <= 3 ? 'Podium finisher' : 'Squad grinder'}
          </p>
        </div>
        <div className="flex-1 card px-2 py-3 text-center">
          <div className="w-2.5 h-2.5 rounded-full bg-gold mx-auto mb-1.5" />
          <p className="text-[11px] font-black text-body leading-snug">
            {member.user_id ? 'Claimed profile' : 'Roster member'}
          </p>
        </div>
      </div>

      {/* Point history */}
      <div className="flex items-center justify-between mt-6 mb-2.5">
        <h2 className="font-display font-bold text-lg text-ink">Point history</h2>
      </div>
      <div className="card px-4 py-1.5">
        {events.length === 0 ? (
          <EmptyState title="No points yet — someone do something legendary." />
        ) : (
          events.map(event => (
            <ActivityItem key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}

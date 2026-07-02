'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { PointBubble } from '@/components/PointBubble'
import { ActivityItem } from '@/components/ActivityItem'
import { StatCard } from '@/components/StatCard'
import { Badge } from '@/components/ui/Badge'
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
      <div className="flex flex-col items-center gap-4 pt-16">
        <span className="text-6xl">🤔</span>
        <p className="font-black text-xl text-purple-900">Member not found</p>
        <Link href={`/groups/${groupId}/members`} className="text-purple-600 font-bold underline">← Back to Members</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/groups/${groupId}/members`} className="text-sm text-purple-500 font-bold hover:underline flex items-center gap-1">
        ← Members
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-6 text-white flex flex-col items-center gap-3">
        <MonsterAvatar name={name} size="xl" mood={mood} />
        <div className="text-center">
          <h2 className="text-2xl font-black">{name}</h2>
          <div className="flex items-center gap-2 justify-center mt-1">
            {member.role === 'admin' && <Badge variant="yellow">👑 Admin</Badge>}
            {rank > 0 && <Badge variant="purple">Rank #{rank}</Badge>}
          </div>
        </div>
        <PointBubble points={totalPoints} size="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Points" value={totalPoints} emoji="⭐" color="purple" />
        <StatCard title="This Week" value={weeklyPoints >= 0 ? `+${weeklyPoints}` : weeklyPoints} emoji="📅" color={weeklyPoints >= 0 ? 'green' : 'red'} />
      </div>

      {/* Activity */}
      <div>
        <h3 className="font-black text-purple-900 mb-3">📋 Point History</h3>
        <div className="bg-white rounded-2xl border-2 border-purple-100 px-4">
          {events.length === 0 ? (
            <EmptyState emoji="📭" title="No points yet!" />
          ) : (
            events.map(event => (
              <ActivityItem key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

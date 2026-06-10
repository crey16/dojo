'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MemberCard } from '@/components/MemberCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { getGroupMembers } from '@/lib/data/members'
import { getLeaderboard } from '@/lib/data/points'
import type { GroupMember, LeaderboardEntry } from '@/lib/types'

export default function MembersPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [members, setMembers] = useState<GroupMember[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [m, lb] = await Promise.all([
        getGroupMembers(groupId),
        getLeaderboard(groupId, 'all-time'),
      ])
      setMembers(m)
      setLeaderboard(lb)
      setLoading(false)
    }
    load()
  }, [groupId])

  function getPointsForMember(userId: string) {
    return leaderboard.find(e => e.user_id === userId)?.total_points
  }

  function getRankForMember(userId: string) {
    return leaderboard.find(e => e.user_id === userId)?.rank
  }

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Members" emoji="👥" subtitle={`${members.length} dojo warriors`} />

      {members.length === 0 ? (
        <EmptyState emoji="👤" title="No members yet!" description="Invite friends with your group code." />
      ) : (
        <div className="flex flex-col gap-2">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              groupId={groupId}
              points={getPointsForMember(member.user_id)}
              rank={getRankForMember(member.user_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

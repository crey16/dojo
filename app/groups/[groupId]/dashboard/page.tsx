'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { PointBubble } from '@/components/PointBubble'
import { StatCard } from '@/components/StatCard'
import { ActivityItem } from '@/components/ActivityItem'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCurrentUser, getCurrentUserId } from '@/lib/data/auth'
import { getRecentActivity, getMemberTotalPoints, getLeaderboard } from '@/lib/data/points'
import { getLinkedMember, getMemberRole } from '@/lib/data/members'
import { getChallenges } from '@/lib/data/challenges'
import type { Profile, PointEvent, Challenge } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [user, setUser] = useState<Profile | null>(null)
  const [points, setPoints] = useState(0)
  const [rank, setRank] = useState(0)
  const [totalMembers, setTotalMembers] = useState(0)
  const [activity, setActivity] = useState<PointEvent[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [currentUser, userId] = await Promise.all([getCurrentUser(), getCurrentUserId()])
      setUser(currentUser)

      if (userId) {
        const linkedMember = await getLinkedMember(groupId, userId)
        const [userPoints, leaderboard, recentActivity, activeChallenges, role] = await Promise.all([
          linkedMember ? getMemberTotalPoints(groupId, linkedMember.id) : Promise.resolve(0),
          getLeaderboard(groupId, 'all-time'),
          getRecentActivity(groupId, 10),
          getChallenges(groupId),
          getMemberRole(groupId, userId),
        ])

        setPoints(userPoints)
        setTotalMembers(leaderboard.length)
        const entry = leaderboard.find(e => e.user_id === userId)
        setRank(entry?.rank ?? 0)
        setActivity(recentActivity)
        setChallenges(activeChallenges.filter(c => c.active))
        setIsAdmin(role === 'admin')
      }

      setLoading(false)
    }
    load()
  }, [groupId])

  const greetings = ['What up,', 'Yo,', 'Sup,', 'Hey hey,', 'Look who it is —']
  const greeting = user ? greetings[Math.abs(user.display_name.charCodeAt(0)) % greetings.length] : 'Hey,'

  if (loading) return <LoadingState message="Loading your dojo..." />

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-6 text-white flex items-center gap-4 shadow-lg">
        <MonsterAvatar
          name={user?.display_name ?? 'You'}
          size="lg"
          mood={points > 0 ? 'happy' : points < 0 ? 'guilty' : 'neutral'}
        />
        <div className="flex-1 min-w-0">
          <p className="text-purple-200 text-sm font-medium">{greeting}</p>
          <h2 className="text-2xl font-black truncate">{user?.display_name ?? 'Player'}</h2>
          <p className="text-purple-200 text-xs mt-0.5">Rank #{rank} of {totalMembers}</p>
        </div>
        <PointBubble points={points} size="lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Points" value={points} emoji="⭐" color="purple" />
        <StatCard title="Rank" value={rank ? `#${rank}` : '—'} emoji="🏆" color="yellow" />
        <StatCard title="Members" value={totalMembers} emoji="👥" color="blue" />
      </div>

      {/* Active challenges preview */}
      {challenges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-purple-900">⚔️ Active Quests</h3>
            <Link href={`/groups/${groupId}/challenges`} className="text-xs text-purple-500 font-bold hover:underline">
              See all →
            </Link>
          </div>
          <div className="bg-purple-100 rounded-2xl p-3">
            <p className="text-sm font-bold text-purple-800 flex items-center gap-2">
              <span className="text-xl">{challenges[0].points > 5 ? '🔥' : '✨'}</span>
              {challenges[0].title}
              <span className="ml-auto text-purple-600 font-black">+{challenges[0].points}</span>
            </p>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-purple-900">📋 Recent Activity</h3>
          <Link href={`/groups/${groupId}/leaderboard`} className="text-xs text-purple-500 font-bold hover:underline">
            Leaderboard →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border-2 border-purple-100 px-4">
          {activity.length === 0 ? (
            <EmptyState emoji="📭" title="Nothing yet!" description="Point events will show up here." />
          ) : (
            activity.slice(0, 8).map(event => (
              <ActivityItem key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      {/* Admin quick access */}
      {isAdmin && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
          <p className="font-black text-yellow-800 mb-2">👑 Admin Quick Access</p>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/groups/${groupId}/members`} className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-black border-b-2 border-purple-800 active:scale-95 transition-all">
              Open Class Roster
            </Link>
            <Link href={`/groups/${groupId}/admin`} className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-xl text-xs font-black border-b-2 border-yellow-600 active:scale-95 transition-all">
              Award Points
            </Link>
            <Link href={`/groups/${groupId}/admin`} className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-xl text-xs font-black border-b-2 border-yellow-600 active:scale-95 transition-all">
              Manage Members
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

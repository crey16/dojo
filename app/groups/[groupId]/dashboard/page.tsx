'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { StatCard } from '@/components/StatCard'
import { ActivityItem } from '@/components/ActivityItem'
import { PointBubble } from '@/components/PointBubble'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
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
        const entry = linkedMember ? leaderboard.find(e => e.member_id === linkedMember.id) : undefined
        setRank(entry?.rank ?? 0)
        setActivity(recentActivity)
        setChallenges(activeChallenges.filter(c => c.active))
        setIsAdmin(role === 'admin')
      }

      setLoading(false)
    }
    load()
  }, [groupId])

  if (loading) return <LoadingState message="Loading your dojo..." />

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
  const firstName = user?.display_name?.split(' ')[0] ?? 'Player'
  const featured = challenges.length > 0
    ? challenges.reduce((max, c) => (c.points > max.points ? c : max), challenges[0])
    : null

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-[13px] font-extrabold text-muted tracking-wide">{today}</p>
          <h1 className="font-display font-bold text-[28px] leading-tight text-ink mt-0.5">Hey {firstName}!</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="mt-3.5 bg-primary rounded-3xl p-5 flex items-center gap-4 shadow-[0_6px_20px_rgba(124,58,237,0.25)] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/8" />
        <div className="absolute right-5 -bottom-12 w-24 h-24 rounded-full bg-white/6" />
        <span className="w-[88px] h-[88px] rounded-full bg-white/20 flex items-center justify-center flex-none animate-floaty">
          <MonsterAvatar name={user?.display_name ?? 'You'} size="md" mood={points >= 0 ? 'happy' : 'guilty'} />
        </span>
        <div className="relative">
          <p className="text-xs font-extrabold text-white/75 tracking-widest">ALL TIME</p>
          <p className="font-display font-bold text-[44px] leading-none text-white tabular-nums">
            {points} <span className="text-xl">pts</span>
          </p>
          {rank > 0 && (
            <span className="inline-flex items-center gap-1.5 mt-2 bg-white/18 rounded-full px-3 py-1 text-xs font-extrabold text-white">
              Rank #{rank} of {totalMembers}
            </span>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard title="points" value={points >= 0 ? `+${points}` : `−${Math.abs(points)}`} color={points >= 0 ? 'green' : 'red'} />
        <StatCard title="rank" value={rank ? `#${rank}` : '—'} color="yellow" />
        <StatCard title="challenges" value={challenges.length} color="purple" />
      </div>

      {/* Featured challenge */}
      {featured && (
        <Link
          href={`/groups/${groupId}/challenges`}
          className="card mt-4 p-4 flex items-center gap-3.5 transition-transform active:scale-[0.985]"
        >
          <span className="w-11 h-11 rounded-[14px] bg-gold-soft text-[#D97706] inline-flex items-center justify-center flex-none">
            <Icon name="flag" size={22} className="stroke-[2.2]" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-black text-sm text-ink truncate">{featured.title}</span>
            <span className="block text-xs font-bold text-muted">Biggest active challenge</span>
          </span>
          <PointBubble points={featured.points} showSign />
        </Link>
      )}

      {/* Recent activity */}
      <div className="flex items-baseline justify-between mt-6 mb-2.5">
        <h2 className="font-display font-bold text-lg text-ink">Recent activity</h2>
        <Link href={`/groups/${groupId}/leaderboard`} className="text-xs font-extrabold text-primary hover:text-primary-dark">
          See leaderboard
        </Link>
      </div>
      <div className="card px-4 py-1.5">
        {activity.length === 0 ? (
          <EmptyState title="Nothing yet — someone do something legendary." description="Point events will show up here." />
        ) : (
          activity.slice(0, 6).map(event => (
            <ActivityItem key={event.id} event={event} />
          ))
        )}
      </div>

      {/* Admin quick access */}
      {isAdmin && (
        <div className="card mt-4 p-4">
          <p className="font-display font-bold text-base text-ink mb-2.5">Admin shortcuts</p>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/groups/${groupId}/members`} className="bg-primary text-white px-4 py-2 rounded-full text-xs font-black btn-edge active:translate-y-px transition-transform">
              Open the squad board
            </Link>
            <Link href={`/groups/${groupId}/admin`} className="bg-primary-soft text-primary-dark px-4 py-2 rounded-full text-xs font-black active:translate-y-px transition-transform">
              Admin panel
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { LeaderboardCard } from '@/components/LeaderboardCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { getLeaderboard } from '@/lib/data/points'
import { getCurrentUserId } from '@/lib/data/auth'
import type { LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [tab, setTab] = useState<'all-time' | 'weekly'>('weekly')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserId().then(setUserId)
  }, [])

  useEffect(() => {
    setLoading(true)
    getLeaderboard(groupId, tab).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [groupId, tab])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Leaderboard" emoji="🏆" subtitle="Who&apos;s carrying? Who&apos;s flaking?" />

      <Tabs
        tabs={[
          { id: 'weekly', label: 'This Week', emoji: '📅' },
          { id: 'all-time', label: 'All Time', emoji: '🏆' },
        ]}
        activeTab={tab}
        onChange={id => setTab(id as 'all-time' | 'weekly')}
      />

      {loading ? (
        <LoadingState />
      ) : entries.length === 0 ? (
        <EmptyState emoji="👀" title="No data yet!" description="Point events will populate the leaderboard." />
      ) : (
        <div className="flex flex-col gap-2">
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-4 flex flex-col gap-2 mb-2">
              <p className="text-xs font-black text-yellow-700 uppercase tracking-wide">🥇 Top Players</p>
              {top3.map(entry => (
                <LeaderboardCard key={entry.member_id} entry={entry} isCurrentUser={entry.user_id === userId} />
              ))}
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2">
              {rest.map(entry => (
                <LeaderboardCard key={entry.member_id} entry={entry} isCurrentUser={entry.user_id === userId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

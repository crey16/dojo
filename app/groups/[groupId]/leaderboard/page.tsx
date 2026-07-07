'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs } from '@/components/ui/Tabs'
import { LeaderboardCard } from '@/components/LeaderboardCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { AvatarDisc } from '@/components/MonsterAvatar'
import { getLeaderboard } from '@/lib/data/points'
import { getCurrentUserId } from '@/lib/data/auth'
import type { LeaderboardEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

const PODIUM = [
  { chip: 'bg-gold-soft text-gold-ink', bar: 'bg-[#FDE68A] h-[62px]', disc: 88, ring: 'ring-[3px] ring-gold shadow-[0_4px_14px_rgba(251,191,36,0.4)]' },
  { chip: 'bg-[#E5E7EB] text-[#4B5563]', bar: 'bg-[#E5E7EB] h-11', disc: 72, ring: '' },
  { chip: 'bg-[#FFEDD5] text-[#C2410C]', bar: 'bg-[#FED7AA] h-[34px]', disc: 72, ring: '' },
]

function Crown() {
  return (
    <svg width="34" height="26" viewBox="0 0 24 20" className="-mb-1" aria-hidden="true">
      <path d="M3 17L1.5 6l6 4L12 2l4.5 8 6-4L21 17z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

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
  // Podium visual order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumStyle = [PODIUM[1], PODIUM[0], PODIUM[2]]
  const podiumLabel = ['2nd', '1st', '3rd']

  return (
    <div className="flex flex-col">
      <PageHeader title="Leaderboard" subtitle="Who's carrying? Who's flaking?" />

      <Tabs
        tabs={[
          { id: 'weekly', label: 'This week' },
          { id: 'all-time', label: 'All time' },
        ]}
        activeTab={tab}
        onChange={id => setTab(id as 'all-time' | 'weekly')}
      />

      {loading ? (
        <LoadingState />
      ) : entries.length === 0 ? (
        <div className="card mt-4">
          <EmptyState title="No points yet — someone do something legendary." description="Point events will populate the leaderboard." />
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length === 3 && (
            <div className="flex items-end justify-center gap-3.5 mt-6">
              {podiumOrder.map((entry, i) => entry && (
                <Link
                  key={entry.member_id}
                  href={`/groups/${groupId}/members/${entry.member_id}`}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 transition-transform active:scale-[0.96]',
                    i === 1 ? 'max-w-[120px]' : 'max-w-[110px]'
                  )}
                >
                  {i === 1 && <Crown />}
                  <span className={cn('rounded-full', podiumStyle[i].ring, i === 1 && 'animate-floaty')}>
                    <AvatarDisc name={entry.display_name} size={i === 1 ? 'lg' : 'md'} mood="happy" className="shadow-card" />
                  </span>
                  <span className="font-black text-[13px] text-ink truncate max-w-full">{entry.display_name}</span>
                  <span className={cn('rounded-full px-2.5 py-[3px] text-[11px] font-black tabular-nums', podiumStyle[i].chip)}>
                    {podiumLabel[i]} · {entry.total_points}
                  </span>
                  <span className={cn('w-full rounded-t-[14px]', podiumStyle[i].bar)} />
                </Link>
              ))}
            </div>
          )}

          {/* Rest (or all, when fewer than 3) */}
          {(top3.length === 3 ? rest : entries).length > 0 && (
            <div className="card px-4 py-1.5 mt-4">
              {(top3.length === 3 ? rest : entries).map(entry => (
                <LeaderboardCard key={entry.member_id} entry={entry} isCurrentUser={entry.user_id === userId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

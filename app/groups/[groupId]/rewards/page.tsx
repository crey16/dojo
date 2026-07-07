'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RewardCard } from '@/components/RewardCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Confetti } from '@/components/Confetti'
import { Badge } from '@/components/ui/Badge'
import { getRewards, getRedemptions } from '@/lib/data/rewards'
import { getMemberTotalPoints } from '@/lib/data/points'
import { getCurrentUserId } from '@/lib/data/auth'
import { getLinkedMember, getMemberRole } from '@/lib/data/members'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { redeemRewardAction } from '@/app/actions/rewards'
import type { Reward, RewardRedemption } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

export default function RewardsPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      const uid = await getCurrentUserId()
      setUserId(uid)
      const linkedMember = await getLinkedMember(groupId, uid)
      const [rwds, redemps, pts, role] = await Promise.all([
        getRewards(groupId),
        getRedemptions(groupId),
        linkedMember ? getMemberTotalPoints(groupId, linkedMember.id) : Promise.resolve(0),
        getMemberRole(groupId, uid),
      ])
      setRewards(rwds)
      setRedemptions(redemps)
      setUserPoints(pts)
      setIsAdmin(role === 'admin')
      setLoading(false)
    }
    load()
  }, [groupId])

  async function handleRedeem(reward: Reward) {
    setRedeeming(true)
    const { error } = isSupabaseConfigured()
      ? await redeemRewardAction(reward.id)
      : { error: null }

    if (error) {
      setErrorMsg(error)
    } else {
      setErrorMsg('')
      setConfetti(true)
      setSuccessMsg(`Redemption submitted for "${reward.title}" — waiting for admin approval.`)
      const redemps = await getRedemptions(groupId)
      setRedemptions(redemps)
    }
    setRedeeming(false)
  }

  const myRedemptions = redemptions.filter(r => r.user_id === userId)

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-4">
      <Confetti trigger={confetti} onComplete={() => setConfetti(false)} />

      <PageHeader
        title="Rewards"
        subtitle="Spend your points on squad-approved perks"
        action={
          <span className="bg-primary-soft text-primary-dark rounded-full px-3.5 py-1.5 font-black text-[13px] tabular-nums">
            {userPoints} pts
          </span>
        }
      />

      {successMsg && (
        <div className="bg-positive-soft rounded-[18px] p-3.5 flex items-center gap-3">
          <p className="flex-1 text-[13px] font-extrabold text-positive-ink">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} aria-label="Dismiss" className="text-positive-ink font-black text-sm cursor-pointer px-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-negative-soft rounded-[18px] p-3.5 flex items-center gap-3">
          <p className="flex-1 text-[13px] font-extrabold text-negative-ink">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} aria-label="Dismiss" className="text-negative-ink font-black text-sm cursor-pointer px-2">✕</button>
        </div>
      )}

      {rewards.length === 0 ? (
        <div className="card">
          <EmptyState title="No rewards yet" description="Admins can add rewards in the admin panel." />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={userPoints}
              isAdmin={isAdmin}
              onRedeem={redeeming ? undefined : handleRedeem}
            />
          ))}
        </div>
      )}

      {myRedemptions.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-lg text-ink mt-2 mb-2.5">Redemption history</h3>
          <div className="card px-4 py-1.5">
            {myRedemptions.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-3 border-b border-hairline last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[13px] text-ink truncate">{r.reward?.title ?? 'Unknown reward'}</p>
                  <p className="text-[11.5px] font-bold text-muted">{formatRelativeTime(r.created_at)}</p>
                </div>
                <Badge variant={r.status === 'approved' ? 'green' : r.status === 'denied' ? 'red' : 'yellow'}>
                  {r.status === 'approved' ? 'Approved' : r.status === 'denied' ? 'Denied' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

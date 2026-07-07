'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RewardCard } from '@/components/RewardCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
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
      setSuccessMsg(`🎉 Redemption submitted for "${reward.title}"! Wait for admin approval.`)
      const redemps = await getRedemptions(groupId)
      setRedemptions(redemps)
    }
    setRedeeming(false)
  }

  const myRedemptions = redemptions.filter(r => r.user_id === userId)

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <Confetti trigger={confetti} onComplete={() => setConfetti(false)} />

      <PageHeader
        title="Rewards"
        emoji="🎁"
        subtitle={`You have ${userPoints} points to spend`}
      />

      {successMsg && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-sm font-bold text-green-700">{successMsg}</p>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="mt-1">Dismiss</Button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3">
          <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          <Button variant="ghost" size="sm" onClick={() => setErrorMsg('')} className="mt-1">Dismiss</Button>
        </div>
      )}

      {rewards.length === 0 ? (
        <EmptyState emoji="🎁" title="No rewards yet!" description="Admins can add rewards in the admin panel." />
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
          <h3 className="font-black text-purple-900 mb-3">📜 My Redemptions</h3>
          <div className="flex flex-col gap-2">
            {myRedemptions.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border-2 border-purple-100 p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-gray-800">{r.reward?.title ?? 'Unknown reward'}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(r.created_at)}</p>
                </div>
                <Badge variant={r.status === 'approved' ? 'green' : r.status === 'denied' ? 'red' : 'yellow'}>
                  {r.status === 'approved' ? '✅ Approved' : r.status === 'denied' ? '❌ Denied' : '⏳ Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

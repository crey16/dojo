'use server'

import { createClient } from '@/lib/supabase/server'
import type { Reward } from '@/lib/types'

export async function createRewardAction(
  groupId: string,
  reward: Omit<Reward, 'id' | 'created_at' | 'group_id'>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('rewards').insert({ ...reward, group_id: groupId })
  return { error: error?.message ?? null }
}

export async function redeemRewardAction(
  rewardId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // RPC enforces active reward, membership, balance, and one pending request
  const { error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId })
  return { error: error?.message ?? null }
}

export async function updateRedemptionStatusAction(
  redemptionId: string,
  status: 'approved' | 'denied'
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Idempotent RPC: admin-checked, deducts points on approval
  const { error } = await supabase.rpc('review_redemption', {
    p_redemption_id: redemptionId,
    p_approve: status === 'approved',
  })
  return { error: error?.message ?? null }
}

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
  rewardId: string,
  groupId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reward_redemptions').insert({
    reward_id: rewardId,
    user_id: user.id,
    group_id: groupId,
    status: 'pending',
  })
  return { error: error?.message ?? null }
}

export async function updateRedemptionStatusAction(
  redemptionId: string,
  status: 'approved' | 'denied'
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reward_redemptions')
    .update({ status })
    .eq('id', redemptionId)
  return { error: error?.message ?? null }
}

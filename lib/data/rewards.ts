'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { Reward, RewardRedemption } from '../types'
import { MOCK_REWARDS, MOCK_REDEMPTIONS } from '../mock-data'

export async function getRewards(groupId: string): Promise<Reward[]> {
  if (!isSupabaseConfigured()) return MOCK_REWARDS
  const supabase = createClient()
  const { data } = await supabase
    .from('rewards')
    .select('*')
    .eq('group_id', groupId)
    .eq('active', true)
    .order('cost', { ascending: true })
  return data ?? []
}

export async function createReward(groupId: string, reward: Omit<Reward, 'id' | 'created_at' | 'group_id'>): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase.from('rewards').insert({ ...reward, group_id: groupId })
  return { error: error?.message ?? null }
}

export async function redeemReward(rewardId: string, userId: string, groupId: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase.from('reward_redemptions').insert({
    reward_id: rewardId,
    user_id: userId,
    group_id: groupId,
    status: 'pending',
  })
  return { error: error?.message ?? null }
}

export async function getRedemptions(groupId: string): Promise<RewardRedemption[]> {
  if (!isSupabaseConfigured()) return MOCK_REDEMPTIONS
  const supabase = createClient()
  const { data } = await supabase
    .from('reward_redemptions')
    .select('*, reward:rewards(*), profile:profiles!reward_redemptions_user_id_fkey(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updateRedemptionStatus(
  redemptionId: string,
  status: 'approved' | 'denied'
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase
    .from('reward_redemptions')
    .update({ status })
    .eq('id', redemptionId)
  return { error: error?.message ?? null }
}

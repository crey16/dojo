'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { PointEvent, PointCategory, LeaderboardEntry } from '../types'
import {
  MOCK_POINT_EVENTS,
  MOCK_CATEGORIES,
  MOCK_LEADERBOARD_ALL_TIME,
  MOCK_LEADERBOARD_WEEKLY,
  getMockUserPoints,
} from '../mock-data'
import { getWeekStart } from '../utils'

export async function getPointCategories(groupId: string): Promise<PointCategory[]> {
  if (!isSupabaseConfigured()) return MOCK_CATEGORIES
  const supabase = createClient()
  const { data } = await supabase
    .from('point_categories')
    .select('*')
    .eq('group_id', groupId)
    .order('type', { ascending: false })
  return data ?? []
}

export async function getRecentActivity(groupId: string, limit = 20): Promise<PointEvent[]> {
  if (!isSupabaseConfigured()) return MOCK_POINT_EVENTS.slice(0, limit)
  const supabase = createClient()
  const { data } = await supabase
    .from('point_events')
    .select('*, profile:profiles!point_events_user_id_fkey(*), giver_profile:profiles!point_events_giver_id_fkey(*), category:point_categories(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getUserPointEvents(groupId: string, userId: string): Promise<PointEvent[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_POINT_EVENTS.filter(e => e.user_id === userId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('point_events')
    .select('*, profile:profiles!point_events_user_id_fkey(*), giver_profile:profiles!point_events_giver_id_fkey(*), category:point_categories(*)')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getUserTotalPoints(groupId: string, userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return getMockUserPoints(userId)
  const supabase = createClient()
  const { data } = await supabase
    .from('point_events')
    .select('amount')
    .eq('group_id', groupId)
    .eq('user_id', userId)
  return (data ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
}

export async function getLeaderboard(groupId: string, period: 'all-time' | 'weekly'): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return period === 'weekly' ? MOCK_LEADERBOARD_WEEKLY : MOCK_LEADERBOARD_ALL_TIME
  }
  const supabase = createClient()
  let query = supabase
    .from('point_events')
    .select('user_id, amount, profiles!point_events_user_id_fkey(display_name)')
    .eq('group_id', groupId)

  if (period === 'weekly') {
    query = query.gte('created_at', getWeekStart().toISOString())
  }

  const { data } = await query
  if (!data) return []

  const totals: Record<string, { display_name: string; total: number }> = {}
  for (const row of data as unknown as Array<{ user_id: string; amount: number; profiles: { display_name: string } | null }>) {
    if (!totals[row.user_id]) {
      totals[row.user_id] = { display_name: row.profiles?.display_name ?? 'Unknown', total: 0 }
    }
    totals[row.user_id].total += row.amount
  }

  return Object.entries(totals)
    .map(([user_id, { display_name, total }]) => ({ user_id, display_name, total_points: total, rank: 0 }))
    .sort((a, b) => b.total_points - a.total_points)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

export async function awardPoints(
  groupId: string,
  userId: string,
  giverId: string,
  amount: number,
  categoryId: string | null,
  reason: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  const supabase = createClient()
  const { error } = await supabase.from('point_events').insert({
    group_id: groupId,
    user_id: userId,
    giver_id: giverId,
    amount,
    category_id: categoryId,
    reason,
  })
  return { error: error?.message ?? null }
}

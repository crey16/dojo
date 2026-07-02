'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { PointEvent, PointCategory, LeaderboardEntry } from '../types'
import {
  MOCK_POINT_EVENTS,
  MOCK_CATEGORIES,
  MOCK_LEADERBOARD_ALL_TIME,
  MOCK_LEADERBOARD_WEEKLY,
  getMockMemberPoints,
} from '../mock-data'
import { getWeekStart } from '../utils'
import { computeLeaderboard } from '../points-math'

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
    .select('*, member:group_members!point_events_member_id_fkey(*), giver_profile:profiles!point_events_giver_id_fkey(*), category:point_categories(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getMemberPointEvents(groupId: string, memberId: string): Promise<PointEvent[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_POINT_EVENTS.filter(e => e.member_id === memberId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('point_events')
    .select('*, member:group_members!point_events_member_id_fkey(*), giver_profile:profiles!point_events_giver_id_fkey(*), category:point_categories(*)')
    .eq('group_id', groupId)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMemberTotalPoints(groupId: string, memberId: string): Promise<number> {
  if (!isSupabaseConfigured()) return getMockMemberPoints(memberId)
  const supabase = createClient()
  const { data } = await supabase
    .from('point_events')
    .select('amount')
    .eq('group_id', groupId)
    .eq('member_id', memberId)
  return (data ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
}

export async function getLeaderboard(groupId: string, period: 'all-time' | 'weekly'): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return period === 'weekly' ? MOCK_LEADERBOARD_WEEKLY : MOCK_LEADERBOARD_ALL_TIME
  }
  const supabase = createClient()
  let query = supabase
    .from('point_events')
    .select('member_id, amount')
    .eq('group_id', groupId)

  if (period === 'weekly') {
    query = query.gte('created_at', getWeekStart().toISOString())
  }

  const [{ data }, { data: members }] = await Promise.all([
    query,
    supabase.from('group_members').select('id, display_name, user_id').eq('group_id', groupId),
  ])
  if (!data) return []

  // Every event's member_id references a group_members row (FK, cascade delete),
  // so the members list covers all events
  return computeLeaderboard(members ?? [], data as Array<{ member_id: string; amount: number }>)
}

export async function awardPoints(
  groupId: string,
  memberId: string,
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
    member_id: memberId,
    giver_id: giverId,
    amount,
    category_id: categoryId,
    reason,
  })
  return { error: error?.message ?? null }
}

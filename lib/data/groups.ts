'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { Group } from '../types'
import { MOCK_GROUP, MOCK_GROUP_ID } from '../mock-data'
import { generateInviteCode } from '../utils'

export async function getGroup(groupId: string): Promise<Group | null> {
  if (!isSupabaseConfigured()) {
    return groupId === MOCK_GROUP_ID ? MOCK_GROUP : null
  }
  const supabase = createClient()
  const { data } = await supabase.from('groups').select('*').eq('id', groupId).single()
  return data
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  if (!isSupabaseConfigured()) {
    return [MOCK_GROUP]
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
  return (data?.map((row: { groups: Group | Group[] }) => {
    const g = row.groups
    return Array.isArray(g) ? g[0] : g
  }).filter(Boolean) ?? []) as Group[]
}

export async function createGroup(name: string, _userId: string): Promise<{ group: Group | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { group: { ...MOCK_GROUP, name, id: `group-${Date.now()}` }, error: null }
  }
  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_group_with_admin', {
    p_name: name,
    p_invite_code: generateInviteCode(),
  })
  if (error) return { group: null, error: error.message }
  return { group: data as Group, error: null }
}

export async function joinGroup(inviteCode: string, _userId: string): Promise<{ group: Group | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { group: MOCK_GROUP, error: null }
  }
  const supabase = createClient()
  const { data, error } = await supabase.rpc('join_group_with_code', {
    p_invite_code: inviteCode,
  })
  if (error) return { group: null, error: error.message }
  return { group: data as Group, error: null }
}

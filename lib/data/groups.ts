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

export async function createGroup(name: string, userId: string): Promise<{ group: Group | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { group: { ...MOCK_GROUP, name, id: `group-${Date.now()}` }, error: null }
  }
  const supabase = createClient()
  const invite_code = generateInviteCode()
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, invite_code, created_by: userId })
    .select()
    .single()
  if (error) return { group: null, error: error.message }
  await supabase.from('group_members').insert({ group_id: data.id, user_id: userId, display_name: 'Admin', role: 'admin', created_by: userId })
  return { group: data, error: null }
}

export async function joinGroup(inviteCode: string, userId: string): Promise<{ group: Group | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { group: MOCK_GROUP, error: null }
  }
  const supabase = createClient()
  const { data: group, error: gError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
  if (gError || !group) return { group: null, error: 'Invalid invite code' }
  const { error } = await supabase
    .from('group_members')
    .upsert({ group_id: group.id, user_id: userId, display_name: 'Member', role: 'member', created_by: userId })
  if (error) return { group: null, error: error.message }
  return { group, error: null }
}

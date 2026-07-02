'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { GroupMember } from '../types'
import { MOCK_MEMBERS, MOCK_USER_ID } from '../mock-data'

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_MEMBERS
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('group_members')
    .select('*, profile:profiles(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
  return (data ?? []) as GroupMember[]
}

export async function getMemberRole(groupId: string, userId: string): Promise<'admin' | 'member' | null> {
  if (!isSupabaseConfigured()) {
    return userId === MOCK_USER_ID ? 'admin' : 'member'
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()
  return data?.role ?? null
}

export async function removeMember(groupId: string, userId: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  const supabase = createClient()
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function getLinkedMember(groupId: string, userId: string): Promise<GroupMember | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_MEMBERS.find(member => member.user_id === userId) ?? null
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('group_members')
    .select('*, profile:profiles(*)')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()
  return data as GroupMember | null
}

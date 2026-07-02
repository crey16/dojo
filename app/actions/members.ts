'use server'

import { createClient } from '@/lib/supabase/server'

function memberActionError(message?: string) {
  if (message?.includes('schema cache') || message?.includes('avatar_seed') || message?.includes('display_name')) {
    return 'The Supabase roster migration has not been applied yet. Run supabase/migrate-roster-members.sql in the Supabase SQL Editor, then refresh this page.'
  }
  return message ?? null
}

export async function createMemberAction(groupId: string, displayName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: null,
    display_name: displayName.trim(),
    role: 'member',
    status: 'active',
    avatar_seed: `${displayName.trim()}-${Date.now()}`,
    created_by: user.id,
  })
  return { error: memberActionError(error?.message) }
}

export async function updateMemberAction(
  memberId: string,
  updates: { display_name?: string; status?: 'active' | 'inactive' | 'absent'; role?: 'admin' | 'member' }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('group_members').update(updates).eq('id', memberId)
  return { error: memberActionError(error?.message) }
}

export async function deleteMemberAction(memberId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('group_members').delete().eq('id', memberId)
  return { error: memberActionError(error?.message) }
}

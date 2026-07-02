'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/utils'
import type { ClaimableMember, Group } from '@/lib/types'

export async function createGroupAction(name: string): Promise<{ group: Group | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { group: null, error: 'Not authenticated' }

  const invite_code = generateInviteCode()
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, invite_code, created_by: user.id })
    .select()
    .single()

  if (error) return { group: null, error: error.message }

  await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: user.id,
    display_name: user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Admin',
    role: 'admin',
    created_by: user.id,
  })

  return { group: data, error: null }
}

export async function joinGroupAction(inviteCode: string): Promise<{ group: Group | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { group: null, error: 'Not authenticated' }

  const { data: groups, error: gError } = await supabase
    .rpc('get_group_by_invite_code', { p_invite_code: inviteCode })

  const group = groups?.[0]
  if (gError || !group) return { group: null, error: 'Invalid invite code' }

  // Plain insert: upsert's ON CONFLICT trips the select RLS policy for non-members
  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      display_name: user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Member',
      role: 'member',
      created_by: user.id,
    })

  // 23505 unique violation = already a member, treat as success
  if (error && error.code !== '23505') return { group: null, error: error.message }
  return { group, error: null }
}

export async function getJoinPreviewAction(
  inviteCode: string
): Promise<{ group: Group | null; claimable: ClaimableMember[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { group: null, claimable: [], error: 'Not authenticated' }

  const [{ data: groups, error: gError }, { data: claimable }] = await Promise.all([
    supabase.rpc('get_group_by_invite_code', { p_invite_code: inviteCode }),
    supabase.rpc('get_claimable_members', { p_invite_code: inviteCode }),
  ])

  const group = groups?.[0]
  if (gError || !group) return { group: null, claimable: [], error: 'Invalid invite code' }

  return { group, claimable: claimable ?? [], error: null }
}

export async function claimMemberAction(
  inviteCode: string,
  memberId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.rpc('claim_roster_member', {
    p_invite_code: inviteCode,
    p_member_id: memberId,
  })

  // Raised exceptions from the RPC already carry a friendly message
  return { error: error?.message ?? null }
}

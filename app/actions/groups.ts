'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/utils'
import type { ClaimableMember, Group } from '@/lib/types'

export async function createGroupAction(name: string): Promise<{ group: Group | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { group: null, error: 'Not authenticated' }

  // Atomic RPC: group + admin membership + default categories, or nothing
  const { data, error } = await supabase.rpc('create_group_with_admin', {
    p_name: name,
    p_invite_code: generateInviteCode(),
  })

  if (error) return { group: null, error: error.message }
  return { group: data as Group, error: null }
}

export async function joinGroupAction(inviteCode: string): Promise<{ group: Group | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { group: null, error: 'Not authenticated' }

  // RPC validates the invite code server-side; direct membership inserts are
  // blocked by RLS. Already-a-member is a no-op success.
  const { data, error } = await supabase.rpc('join_group_with_code', {
    p_invite_code: inviteCode,
  })

  if (error) return { group: null, error: error.message }
  return { group: data as Group, error: null }
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

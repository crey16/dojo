'use server'

import { createClient } from '@/lib/supabase/server'

export async function awardPointsAction(
  groupId: string,
  targetMemberId: string,
  amount: number,
  categoryId: string | null,
  reason: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('point_events').insert({
    group_id: groupId,
    member_id: targetMemberId,
    giver_id: user.id,
    amount,
    category_id: categoryId,
    reason,
  })

  return { error: error?.message ?? null }
}

export async function undoPointEventAction(eventId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('point_events')
    .delete()
    .eq('id', eventId)
    .select('id')

  if (error) return { error: error.message }
  // RLS silently deletes nothing when the caller is not an admin of the event's group
  if (!data || data.length === 0) return { error: 'Only group admins can undo point events.' }
  return { error: null }
}

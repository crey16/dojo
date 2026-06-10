'use server'

import { createClient } from '@/lib/supabase/server'

export async function awardPointsAction(
  groupId: string,
  targetUserId: string,
  amount: number,
  categoryId: string | null,
  reason: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('point_events').insert({
    group_id: groupId,
    user_id: targetUserId,
    giver_id: user.id,
    amount,
    category_id: categoryId,
    reason,
  })

  return { error: error?.message ?? null }
}

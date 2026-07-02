'use server'

import { createClient } from '@/lib/supabase/server'
import type { Challenge } from '@/lib/types'

export async function createChallengeAction(
  groupId: string,
  challenge: Omit<Challenge, 'id' | 'created_at' | 'group_id'>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('challenges').insert({ ...challenge, group_id: groupId })
  return { error: error?.message ?? null }
}

export async function submitChallengeAction(
  challengeId: string,
  groupId: string,
  proofText: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('challenge_submissions').insert({
    challenge_id: challengeId,
    user_id: user.id,
    group_id: groupId,
    status: 'pending',
    proof_text: proofText,
  })
  return { error: error?.message ?? null }
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: 'approved' | 'denied',
  groupId: string,
  submittedUserId: string,
  points: number
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('challenge_submissions')
    .update({ status })
    .eq('id', submissionId)

  if (!error && status === 'approved') {
    const { data: member } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', submittedUserId)
      .single()
    if (member) {
      await supabase.from('point_events').insert({
        group_id: groupId,
        member_id: member.id,
        giver_id: user.id,
        amount: points,
        category_id: null,
        reason: 'Challenge approved',
      })
    }
  }
  return { error: error?.message ?? null }
}

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
  // Partial unique index: one live submission per challenge per user
  if (error?.code === '23505') return { error: 'You already submitted this challenge' }
  return { error: error?.message ?? null }
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: 'approved' | 'denied'
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Idempotent RPC: admin-checked, points come from the challenge row
  const { error } = await supabase.rpc('review_submission', {
    p_submission_id: submissionId,
    p_approve: status === 'approved',
  })
  return { error: error?.message ?? null }
}

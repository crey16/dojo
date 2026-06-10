'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { Challenge, ChallengeSubmission } from '../types'
import { MOCK_CHALLENGES, MOCK_SUBMISSIONS } from '../mock-data'

export async function getChallenges(groupId: string): Promise<Challenge[]> {
  if (!isSupabaseConfigured()) return MOCK_CHALLENGES
  const supabase = createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createChallenge(
  groupId: string,
  challenge: Omit<Challenge, 'id' | 'created_at' | 'group_id'>
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase.from('challenges').insert({ ...challenge, group_id: groupId })
  return { error: error?.message ?? null }
}

export async function submitChallenge(
  challengeId: string,
  userId: string,
  groupId: string,
  proofText: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase.from('challenge_submissions').insert({
    challenge_id: challengeId,
    user_id: userId,
    group_id: groupId,
    status: 'pending',
    proof_text: proofText,
  })
  return { error: error?.message ?? null }
}

export async function getSubmissions(groupId: string): Promise<ChallengeSubmission[]> {
  if (!isSupabaseConfigured()) return MOCK_SUBMISSIONS
  const supabase = createClient()
  const { data } = await supabase
    .from('challenge_submissions')
    .select('*, challenge:challenges(*), profile:profiles!challenge_submissions_user_id_fkey(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: 'approved' | 'denied',
  groupId: string,
  userId: string,
  points: number
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  const { error } = await supabase
    .from('challenge_submissions')
    .update({ status })
    .eq('id', submissionId)
  if (!error && status === 'approved') {
    await supabase.from('point_events').insert({
      group_id: groupId,
      user_id: userId,
      giver_id: userId,
      amount: points,
      category_id: null,
      reason: 'Challenge approved',
    })
  }
  return { error: error?.message ?? null }
}

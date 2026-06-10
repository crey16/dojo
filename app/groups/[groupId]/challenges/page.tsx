'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChallengeCard } from '@/components/ChallengeCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { getChallenges, submitChallenge, getSubmissions } from '@/lib/data/challenges'
import { getCurrentUserId } from '@/lib/data/auth'
import { getMemberRole } from '@/lib/data/members'
import type { Challenge, ChallengeSubmission } from '@/lib/types'

export default function ChallengesPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([])
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitTarget, setSubmitTarget] = useState<Challenge | null>(null)
  const [proof, setProof] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const uid = await getCurrentUserId()
      setUserId(uid)
      const [ch, subs, role] = await Promise.all([
        getChallenges(groupId),
        getSubmissions(groupId),
        getMemberRole(groupId, uid),
      ])
      setChallenges(ch)
      setSubmissions(subs)
      setIsAdmin(role === 'admin')
      setLoading(false)
    }
    load()
  }, [groupId])

  async function handleSubmit() {
    if (!submitTarget || !proof.trim()) return
    setSubmitting(true)
    const { error } = await submitChallenge(submitTarget.id, userId, groupId, proof.trim())
    if (!error) {
      setSuccessMsg(`🚀 Challenge submitted! Admin will review soon.`)
      const subs = await getSubmissions(groupId)
      setSubmissions(subs)
    }
    setSubmitTarget(null)
    setProof('')
    setSubmitting(false)
  }

  const mySubmissions = submissions.filter(s => s.user_id === userId)
  const submittedIds = new Set(mySubmissions.map(s => s.challenge_id))

  const activeChallenges = challenges.filter(c => c.active)
  const inactiveChallenges = challenges.filter(c => !c.active)

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Challenges" emoji="⚔️" subtitle="Complete quests. Earn big points." />

      {successMsg && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-sm font-bold text-green-700">{successMsg}</p>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="mt-1">Dismiss</Button>
        </div>
      )}

      {/* Submit modal */}
      {submitTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 lg:items-center">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-lg text-purple-900 mb-1">🚀 Submit Challenge</h3>
            <p className="text-sm text-gray-500 mb-4">{submitTarget.title}</p>
            <Textarea
              label="Proof / Notes"
              placeholder="Tell us how you did it..."
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" onClick={() => { setSubmitTarget(null); setProof('') }} className="flex-1">Cancel</Button>
              <Button loading={submitting} onClick={handleSubmit} disabled={!proof.trim()} className="flex-1">Submit!</Button>
            </div>
          </div>
        </div>
      )}

      {activeChallenges.length === 0 ? (
        <EmptyState emoji="⚔️" title="No active challenges!" description="Check back later or ask an admin to create some." />
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-purple-900">🔥 Active</h3>
          {activeChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isAdmin={isAdmin}
              hasSubmitted={submittedIds.has(challenge.id)}
              onSubmit={setSubmitTarget}
            />
          ))}
        </div>
      )}

      {inactiveChallenges.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-gray-500">📦 Past Challenges</h3>
          {inactiveChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isAdmin={isAdmin}
              hasSubmitted={submittedIds.has(challenge.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

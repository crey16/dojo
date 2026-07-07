'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChallengeCard } from '@/components/ChallengeCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { getChallenges, getSubmissions } from '@/lib/data/challenges'
import { getCurrentUserId } from '@/lib/data/auth'
import { getMemberRole } from '@/lib/data/members'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { submitChallengeAction } from '@/app/actions/challenges'
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
  const [errorMsg, setErrorMsg] = useState('')

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

    const { error } = isSupabaseConfigured()
      ? await submitChallengeAction(submitTarget.id, groupId, proof.trim())
      : { error: null }

    if (error) {
      setErrorMsg(error)
    } else {
      setErrorMsg('')
      setSuccessMsg('🚀 Challenge submitted! Admin will review soon.')
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
    <div className="flex flex-col gap-4">
      <PageHeader title="Challenges" subtitle="Complete them, submit proof, earn points" />

      {successMsg && (
        <div className="bg-positive-soft rounded-[18px] p-3.5 flex items-center gap-3">
          <p className="flex-1 text-[13px] font-extrabold text-positive-ink">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} aria-label="Dismiss" className="text-positive-ink font-black text-sm cursor-pointer px-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-negative-soft rounded-[18px] p-3.5 flex items-center gap-3">
          <p className="flex-1 text-[13px] font-extrabold text-negative-ink">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} aria-label="Dismiss" className="text-negative-ink font-black text-sm cursor-pointer px-2">✕</button>
        </div>
      )}

      {submitTarget && (
        <div className="fixed inset-0 z-50 bg-[rgba(31,26,46,0.45)] flex items-end justify-center p-4 lg:items-center" role="dialog" aria-modal="true" aria-label="Submit challenge">
          <div className="bg-canvas rounded-[28px] p-6 w-full max-w-sm shadow-2xl animate-pop-in">
            <h3 className="font-display font-bold text-lg text-ink mb-0.5">Submit proof</h3>
            <p className="text-[13px] font-bold text-muted mb-4">{submitTarget.title}</p>
            <Textarea
              label="Proof / Notes"
              placeholder="Tell us how you did it..."
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" onClick={() => { setSubmitTarget(null); setProof('') }} className="flex-1">Cancel</Button>
              <Button loading={submitting} onClick={handleSubmit} disabled={!proof.trim()} className="flex-1">Submit</Button>
            </div>
          </div>
        </div>
      )}

      {activeChallenges.length === 0 ? (
        <div className="card">
          <EmptyState title="No active challenges" description="Check back later or ask an admin to create some." />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
          <h3 className="font-display font-bold text-lg text-ink mt-2">Past challenges</h3>
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

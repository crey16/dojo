'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { claimMemberAction, getJoinPreviewAction, joinGroupAction } from '@/app/actions/groups'
import { joinGroup } from '@/lib/data/groups'
import { getCurrentUserId } from '@/lib/data/auth'
import { MOCK_GROUP, MOCK_MEMBERS, MOCK_USER_ID } from '@/lib/mock-data'
import type { ClaimableMember, Group } from '@/lib/types'

export default function JoinGroupPage() {
  const router = useRouter()
  const demo = !isSupabaseConfigured()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [group, setGroup] = useState<Group | null>(null)
  const [claimable, setClaimable] = useState<ClaimableMember[]>([])
  const [selectedId, setSelectedId] = useState('')

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')

    if (demo) {
      const storedRoster = window.localStorage.getItem('hcwk-demo-roster')
      const roster: typeof MOCK_MEMBERS = storedRoster ? JSON.parse(storedRoster) : MOCK_MEMBERS
      setGroup(MOCK_GROUP)
      setClaimable(roster
        .filter(member => !member.user_id && member.status !== 'inactive')
        .map(({ id, display_name, avatar_seed }) => ({ id, display_name, avatar_seed })))
      setLoading(false)
      return
    }

    const result = await getJoinPreviewAction(code.trim())
    if (result.error || !result.group) {
      setError(result.error ?? 'Invalid invite code')
    } else if (result.claimable.length === 0) {
      // Nothing to claim — join as a new member right away
      const joined = await joinGroupAction(code.trim())
      if (joined.error || !joined.group) setError(joined.error ?? 'Could not join group')
      else router.push(`/groups/${joined.group.id}/dashboard`)
    } else {
      setGroup(result.group)
      setClaimable(result.claimable)
    }
    setLoading(false)
  }

  async function handleClaim() {
    if (!group || !selectedId) return
    setLoading(true)
    setError('')

    if (demo) {
      const storedRoster = window.localStorage.getItem('hcwk-demo-roster')
      const roster: typeof MOCK_MEMBERS = storedRoster ? JSON.parse(storedRoster) : MOCK_MEMBERS
      window.localStorage.setItem('hcwk-demo-roster', JSON.stringify(
        roster.map(member => member.id === selectedId ? { ...member, user_id: MOCK_USER_ID } : member)))
      router.push(`/groups/${group.id}/dashboard`)
      return
    }

    const result = await claimMemberAction(code.trim(), selectedId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/groups/${group.id}/dashboard`)
    }
  }

  async function handleJoinAsNew() {
    if (!group) return
    setLoading(true)
    setError('')

    if (demo) {
      const userId = await getCurrentUserId()
      await joinGroup(code.trim(), userId)
      router.push(`/groups/${group.id}/dashboard`)
      return
    }

    const result = await joinGroupAction(code.trim())
    if (result.error || !result.group) {
      setError(result.error ?? 'Could not join group')
      setLoading(false)
    } else {
      router.push(`/groups/${result.group.id}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-card p-8 w-full max-w-sm">
        {!group ? (
          <>
            <div className="text-center mb-8">
              <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" className="inline-block rounded-2xl"><rect width="100" height="100" rx="26" fill="#7C3AED" /><circle cx="38" cy="42" r="10" fill="#FFFFFF" /><circle cx="40" cy="43" r="4.5" fill="#1F2937" /><circle cx="62" cy="42" r="10" fill="#FFFFFF" /><circle cx="64" cy="43" r="4.5" fill="#1F2937" /><path d="M36 64 Q50 76 64 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" /></svg>
              <h1 className="font-display font-bold text-2xl text-ink mt-3">Join a dojo</h1>
              <p className="text-[13px] font-bold text-muted mt-1">Enter your 6-letter invite code</p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <Input
                id="code"
                label="Invite Code"
                placeholder="HCWK42"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="text-center text-xl font-black tracking-widest uppercase"
                maxLength={6}
                required
              />

              {error && (
                <div className="bg-negative-soft rounded-[14px] p-3">
                  <p className="text-[13px] font-extrabold text-negative-ink">{error}</p>
                </div>
              )}

              <Button type="submit" loading={loading} size="lg" className="w-full">
                Join group
              </Button>
            </form>

            <p className="text-center text-[13px] font-bold text-muted mt-4">
              Starting fresh?{' '}
              <Link href="/groups/create" className="text-primary font-black hover:text-primary-dark">
                Create a group
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="font-display font-bold text-2xl text-ink">{group.name}</h1>
              <p className="text-[13px] font-bold text-muted mt-1">Are you one of these people? Claim your spot to keep your points.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
              {claimable.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedId(id => id === member.id ? '' : member.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border-2 p-2 cursor-pointer transition-all',
                    selectedId === member.id
                      ? 'border-primary bg-primary-soft'
                      : 'border-shell hover:border-primary/40'
                  )}
                >
                  <MonsterAvatar name={member.avatar_seed || member.display_name} size="sm" />
                  <span className="text-xs font-extrabold text-body truncate w-full text-center">{member.display_name}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-negative-soft rounded-[14px] p-3 mb-4">
                <p className="text-[13px] font-extrabold text-negative-ink">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleClaim} disabled={!selectedId} loading={loading} size="lg" className="w-full">
                That&apos;s me — claim it
              </Button>
              <Button onClick={handleJoinAsNew} variant="secondary" loading={loading} className="w-full">
                I&apos;m new — join as myself
              </Button>
              <button
                type="button"
                onClick={() => { setGroup(null); setClaimable([]); setSelectedId(''); setError('') }}
                className="text-xs text-muted font-black hover:text-body mt-1 cursor-pointer"
              >
                ← Different code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

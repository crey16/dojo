'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createGroupAction } from '@/app/actions/groups'
import { createGroup } from '@/lib/data/groups'
import { getCurrentUserId } from '@/lib/data/auth'

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    let group = null
    let gError: string | null = null

    if (isSupabaseConfigured()) {
      const result = await createGroupAction(name.trim())
      group = result.group
      gError = result.error
    } else {
      const userId = await getCurrentUserId()
      const result = await createGroup(name.trim(), userId)
      group = result.group
      gError = result.error
    }

    if (gError || !group) {
      setError(gError ?? 'Failed to create group')
      setLoading(false)
    } else {
      router.push(`/groups/${group.id}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-card p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" className="inline-block rounded-2xl"><rect width="100" height="100" rx="26" fill="#7C3AED" /><circle cx="38" cy="42" r="10" fill="#FFFFFF" /><circle cx="40" cy="43" r="4.5" fill="#1F2937" /><circle cx="62" cy="42" r="10" fill="#FFFFFF" /><circle cx="64" cy="43" r="4.5" fill="#1F2937" /><path d="M36 64 Q50 76 64 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" /></svg>
          <h1 className="font-display font-bold text-2xl text-ink mt-3">Create your dojo</h1>
          <p className="text-[13px] font-bold text-muted mt-1">Give your group a name</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Group Name"
            placeholder="e.g. HCWK"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          {error && (
            <div className="bg-negative-soft rounded-[14px] p-3">
              <p className="text-[13px] font-extrabold text-negative-ink">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Create group
          </Button>
        </form>

        <p className="text-center text-[13px] font-bold text-muted mt-4">
          Have an invite code?{' '}
          <Link href="/groups/join" className="text-primary font-black hover:text-primary-dark">
            Join instead
          </Link>
        </p>
      </div>
    </div>
  )
}

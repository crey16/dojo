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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border-b-4 border-purple-300">
        <div className="text-center mb-8">
          <span className="text-5xl">🏯</span>
          <h1 className="text-2xl font-black text-purple-900 mt-2">Create Your Dojo</h1>
          <p className="text-sm text-gray-500 mt-1">Give your group a name</p>
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
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            🚀 Create Group
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Have an invite code?{' '}
          <Link href="/groups/join" className="text-purple-600 font-bold hover:underline">
            Join instead
          </Link>
        </p>
      </div>
    </div>
  )
}

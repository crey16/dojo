'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { joinGroupAction } from '@/app/actions/groups'
import { joinGroup } from '@/lib/data/groups'
import { getCurrentUserId } from '@/lib/data/auth'

export default function JoinGroupPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')

    let group = null
    let gError: string | null = null

    if (isSupabaseConfigured()) {
      const result = await joinGroupAction(code.trim())
      group = result.group
      gError = result.error
    } else {
      const userId = await getCurrentUserId()
      const result = await joinGroup(code.trim(), userId)
      group = result.group
      gError = result.error
    }

    if (gError || !group) {
      setError(gError ?? 'Invalid invite code')
      setLoading(false)
    } else {
      router.push(`/groups/${group.id}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border-b-4 border-purple-300">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="text-2xl font-black text-purple-900 mt-2">Join a Dojo</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your 6-letter invite code</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">😬 {error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            🚪 Join Group
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Starting fresh?{' '}
          <Link href="/groups/create" className="text-purple-600 font-bold hover:underline">
            Create a group
          </Link>
        </p>
      </div>
    </div>
  )
}

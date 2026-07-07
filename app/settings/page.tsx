'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getCurrentUser, signOut } from '@/lib/data/auth'
import { updateDisplayNameAction } from '@/app/actions/profile'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameSaving(true)
    setNameMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateDisplayNameAction(nameDraft)
      : { error: null }
    if (error) {
      setNameMsg(error)
    } else {
      setUser(u => (u ? { ...u, display_name: nameDraft.trim() } : u))
      setEditingName(false)
    }
    setNameSaving(false)
  }

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black text-purple-900 mb-6 flex items-center gap-2">⚙️ Settings</h1>

        {user && (
          <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 flex flex-col items-center gap-4 mb-6">
            <MonsterAvatar name={user.display_name} size="xl" mood="happy" />
            {editingName ? (
              <form onSubmit={handleSaveName} className="w-full flex flex-col gap-2">
                <Input
                  label="Display name"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  maxLength={40}
                  required
                  autoFocus
                />
                {nameMsg && <p className="text-xs font-bold text-red-600">{nameMsg}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={nameSaving} className="flex-1">Save</Button>
                  <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setEditingName(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-xl font-black text-gray-800">{user.display_name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => { setNameDraft(user.display_name); setNameMsg(''); setEditingName(true) }}
                >
                  ✏️ Edit name
                </Button>
              </div>
            )}
          </div>
        )}

        {!isSupabaseConfigured() && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
            <h3 className="font-black text-yellow-800 mb-1">🔧 Supabase Setup</h3>
            <p className="text-xs text-yellow-700">
              Add your Supabase credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable real auth and data storage.
            </p>
            <div className="mt-2 bg-yellow-100 rounded-xl p-2 font-mono text-xs text-yellow-800">
              NEXT_PUBLIC_SUPABASE_URL=your_url<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            onClick={handleSignOut}
            loading={loading}
            className="w-full"
          >
            🚪 {isSupabaseConfigured() ? 'Sign Out' : 'Exit Demo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

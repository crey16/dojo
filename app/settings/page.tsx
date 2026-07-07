'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getCurrentUser, getCurrentUserId, signOut } from '@/lib/data/auth'
import { getUserGroups } from '@/lib/data/groups'
import { updateDisplayNameAction } from '@/app/actions/profile'
import Link from 'next/link'
import { AvatarDisc } from '@/components/MonsterAvatar'
import type { Group, Profile } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  useEffect(() => {
    getCurrentUser().then(setUser)
    getCurrentUserId().then(userId => {
      if (userId) getUserGroups(userId).then(setGroups)
    })
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
    <div className="min-h-screen bg-canvas p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="font-display font-bold text-[28px] text-ink mb-5">Settings</h1>

        {user && (
          <div className="card p-6 flex flex-col items-center gap-4 mb-5">
            <AvatarDisc name={user.display_name} size="lg" mood="happy" />
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
                {nameMsg && <p className="text-xs font-extrabold text-negative-ink">{nameMsg}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={nameSaving} className="flex-1">Save</Button>
                  <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setEditingName(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="font-display font-bold text-xl text-ink">{user.display_name}</p>
                <p className="text-[13px] font-bold text-muted">{user.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => { setNameDraft(user.display_name); setNameMsg(''); setEditingName(true) }}
                >
                  Edit name
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-bold text-base text-ink">My groups</h2>
            <span className="text-xs font-extrabold text-muted">{groups.length}</span>
          </div>
          {groups.length === 0 ? (
            <p className="text-[13px] font-bold text-muted py-2">You&apos;re not in any groups yet.</p>
          ) : (
            <div>
              {groups.map(group => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}/dashboard`}
                  className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-0 group"
                >
                  <span className="flex-1 min-w-0 font-extrabold text-sm text-ink truncate">{group.name}</span>
                  <span className="text-xs font-black text-primary">Open</span>
                </Link>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Link href="/groups/join" className="flex-1 bg-primary text-white rounded-full py-2.5 text-center text-[13px] font-black btn-edge active:translate-y-px transition-transform">
              Join a group
            </Link>
            <Link href="/groups/create" className="flex-1 bg-primary-soft text-primary-dark rounded-full py-2.5 text-center text-[13px] font-black active:translate-y-px transition-transform">
              Create a group
            </Link>
          </div>
        </div>

        {!isSupabaseConfigured() && (
          <div className="bg-gold-soft rounded-[18px] p-4 mb-5">
            <h3 className="font-black text-gold-ink mb-1 text-sm">Supabase setup</h3>
            <p className="text-xs font-bold text-gold-ink/90">
              Add your Supabase credentials to <code className="bg-white/60 px-1 rounded">.env.local</code> to enable real auth and data storage.
            </p>
            <div className="mt-2 bg-white/60 rounded-xl p-2 font-mono text-xs text-gold-ink">
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
            {isSupabaseConfigured() ? 'Sign out' : 'Exit demo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

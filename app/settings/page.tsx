'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getCurrentUser, signOut } from '@/lib/data/auth'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

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
            <div className="text-center">
              <p className="text-xl font-black text-gray-800">{user.display_name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
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

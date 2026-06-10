'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signIn } from '@/lib/data/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MOCK_GROUP_ID } from '@/lib/mock-data'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseConfigured()) {
      router.push(`/groups/${MOCK_GROUP_ID}/dashboard`)
      return
    }

    const { error: authError } = await signIn(email, password)
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border-b-4 border-purple-300">
        <div className="text-center mb-8">
          <span className="text-5xl">🥋</span>
          <h1 className="text-2xl font-black text-purple-900 mt-2">Welcome Back!</h1>
          <p className="text-sm text-gray-500 mt-1">Login to your HCWK Dojo account</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-3 mb-4 text-center">
            <p className="text-xs font-bold text-yellow-700">🎮 Demo Mode — click login to enter the demo</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required={isSupabaseConfigured()}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={isSupabaseConfigured()}
          />

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">😬 {error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            🚪 Login
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link href="/signup" className="text-purple-600 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

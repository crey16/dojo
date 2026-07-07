'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signUp } from '@/lib/data/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MOCK_GROUP_ID } from '@/lib/mock-data'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseConfigured()) {
      router.push(`/groups/${MOCK_GROUP_ID}/dashboard`)
      return
    }

    const { error: authError, needsConfirmation } = await signUp(email, password, displayName)
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else if (needsConfirmation) {
      setSuccess(true)
      setLoading(false)
    } else {
      // Confirmation disabled: user is already signed in
      router.push('/')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] shadow-card p-8 w-full max-w-sm text-center">
          <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" className="inline-block rounded-2xl"><rect width="100" height="100" rx="26" fill="#7C3AED" /><circle cx="38" cy="42" r="10" fill="#FFFFFF" /><circle cx="40" cy="43" r="4.5" fill="#1F2937" /><circle cx="62" cy="42" r="10" fill="#FFFFFF" /><circle cx="64" cy="43" r="4.5" fill="#1F2937" /><path d="M36 64 Q50 76 64 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" /></svg>
          <h2 className="font-display font-bold text-2xl text-ink mt-4">Check your email!</h2>
          <p className="text-[13px] font-bold text-muted mt-2">We sent a confirmation link to <strong className="text-body">{email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="mt-6 block text-primary font-black hover:text-primary-dark">Back to log in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-card p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" className="inline-block rounded-2xl"><rect width="100" height="100" rx="26" fill="#7C3AED" /><circle cx="38" cy="42" r="10" fill="#FFFFFF" /><circle cx="40" cy="43" r="4.5" fill="#1F2937" /><circle cx="62" cy="42" r="10" fill="#FFFFFF" /><circle cx="64" cy="43" r="4.5" fill="#1F2937" /><path d="M36 64 Q50 76 64 64" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" /></svg>
          <h1 className="font-display font-bold text-2xl text-ink mt-3">Join the Dojo!</h1>
          <p className="text-[13px] font-bold text-muted mt-1">Create your HCWK account</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="bg-gold-soft rounded-[14px] p-3 mb-4 text-center">
            <p className="text-xs font-black text-gold-ink">Demo mode — click sign up to enter the demo</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="displayName"
            type="text"
            label="Your Name"
            placeholder="What should we call you?"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />
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
            <div className="bg-negative-soft rounded-[14px] p-3">
              <p className="text-[13px] font-extrabold text-negative-ink">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Create account
          </Button>
        </form>

        <p className="text-center text-[13px] font-bold text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-black hover:text-primary-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

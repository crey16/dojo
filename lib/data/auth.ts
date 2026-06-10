'use client'

import { isSupabaseConfigured } from '../supabase/config'
import { createClient } from '../supabase/client'
import type { Profile } from '../types'
import { MOCK_USER_ID, MOCK_PROFILES } from '../mock-data'

export async function getCurrentUser(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROFILES[0]
  }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

export async function getCurrentUserId(): Promise<string> {
  if (!isSupabaseConfigured()) return MOCK_USER_ID
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? ''
}

export async function signOut() {
  if (!isSupabaseConfigured()) return
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error }
}

export async function signUp(email: string, password: string, displayName: string) {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (!error && data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
    })
  }
  return { error }
}

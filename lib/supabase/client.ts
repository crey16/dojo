'use client'

import { createBrowserClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from './config'

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

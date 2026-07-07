'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateDisplayNameAction(displayName: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = displayName.trim()
  if (!name) return { error: 'Display name is required' }
  if (name.length > 40) return { error: 'Display name must be 40 characters or fewer' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name })
    .eq('id', user.id)
  if (error) return { error: error.message }

  // Keep auth metadata in sync so future sessions pick up the new name
  await supabase.auth.updateUser({ data: { display_name: name } })
  return { error: null }
}

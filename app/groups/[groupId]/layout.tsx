'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getGroup } from '@/lib/data/groups'
import { getMemberRole } from '@/lib/data/members'
import { getCurrentUserId } from '@/lib/data/auth'
import type { Group } from '@/lib/types'

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const groupId = params.groupId as string
  const [group, setGroup] = useState<Group | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      const [g, userId] = await Promise.all([getGroup(groupId), getCurrentUserId()])
      setGroup(g)
      if (userId) {
        const role = await getMemberRole(groupId, userId)
        setIsAdmin(role === 'admin')
      }
    }
    load()
  }, [groupId])

  return (
    <AppShell
      groupId={groupId}
      groupName={group?.name}
      isAdmin={isAdmin}
      isDemoMode={!isSupabaseConfigured()}
    >
      {children}
    </AppShell>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ClassToolbar } from '@/components/ClassToolbar'
import { RosterMemberCard } from '@/components/RosterMemberCard'
import { RosterModal } from '@/components/RosterModal'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { ActivityItem } from '@/components/ActivityItem'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { getCurrentUserId } from '@/lib/data/auth'
import { getGroupMembers, getMemberRole } from '@/lib/data/members'
import { getLeaderboard, getMemberPointEvents, getPointCategories } from '@/lib/data/points'
import { computeTotals } from '@/lib/points-math'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MOCK_CATEGORIES, MOCK_MEMBERS, MOCK_POINT_EVENTS, MOCK_USER_ID } from '@/lib/mock-data'
import { awardPointsAction, undoPointEventAction } from '@/app/actions/points'
import { createMemberAction, deleteMemberAction, updateMemberAction, updateMemberAvatarAction } from '@/app/actions/members'
import type { GroupMember, LeaderboardEntry, PointCategory, PointEvent } from '@/lib/types'

type Modal = 'add' | 'member' | 'multiple' | null

export default function MembersPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const demo = !isSupabaseConfigured()
  const [members, setMembers] = useState<GroupMember[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [demoEvents, setDemoEvents] = useState<PointEvent[]>([])
  const [categories, setCategories] = useState<PointCategory[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null)
  const [memberEvents, setMemberEvents] = useState<PointEvent[]>([])
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')
  const [status, setStatus] = useState<GroupMember['status']>('active')
  const [amount, setAmount] = useState('5')
  const [categoryId, setCategoryId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const [nextMembers, nextLeaderboard, nextCategories, userId] = await Promise.all([
      getGroupMembers(groupId), getLeaderboard(groupId, 'all-time'), getPointCategories(groupId), getCurrentUserId(),
    ])
    setMembers(nextMembers)
    setLeaderboard(nextLeaderboard)
    setCategories(nextCategories)
    setCurrentUserId(userId)
    setIsAdmin((await getMemberRole(groupId, userId)) === 'admin')
    setLoading(false)
  }, [groupId])

  useEffect(() => {
    if (demo) {
      const storedMembers = window.localStorage.getItem('hcwk-demo-roster')
      const storedEvents = window.localStorage.getItem('hcwk-demo-events')
      setMembers(storedMembers ? JSON.parse(storedMembers) : MOCK_MEMBERS)
      setDemoEvents(storedEvents ? JSON.parse(storedEvents) : MOCK_POINT_EVENTS)
      setCategories(MOCK_CATEGORIES)
      setCurrentUserId(MOCK_USER_ID)
      setIsAdmin(true)
      setLoading(false)
      return
    }
    load()
  }, [demo, load])

  useEffect(() => {
    if (!demo || loading) return
    window.localStorage.setItem('hcwk-demo-roster', JSON.stringify(members))
    window.localStorage.setItem('hcwk-demo-events', JSON.stringify(demoEvents))
  }, [demo, demoEvents, loading, members])

  const points = useMemo(() => {
    if (demo) return computeTotals(demoEvents)
    return leaderboard.reduce<Record<string, number>>((totals, entry) => {
      totals[entry.member_id] = entry.total_points
      return totals
    }, {})
  }, [demo, demoEvents, leaderboard])

  function closeModal() {
    setModal(null); setSelectedMember(null); setMemberEvents([]); setMessage(''); setDisplayName(''); setStatus('active')
    setAmount('5'); setCategoryId(''); setReason('')
  }

  async function openMember(member: GroupMember) {
    if (selecting) {
      setSelectedIds(ids => ids.includes(member.id) ? ids.filter(id => id !== member.id) : [...ids, member.id])
      return
    }
    setSelectedMember(member); setDisplayName(member.display_name); setStatus(member.status); setModal('member')
    setMemberEvents(demo
      ? demoEvents.filter(event => event.member_id === member.id)
      : await getMemberPointEvents(groupId, member.id))
  }

  async function addMember(event: React.FormEvent) {
    event.preventDefault()
    if (!displayName.trim()) return
    setBusy(true)
    if (demo) {
      const now = new Date().toISOString()
      setMembers(current => [...current, {
        id: `demo-member-${Date.now()}`, group_id: groupId, user_id: null, display_name: displayName.trim(),
        role: 'member', status: 'active', avatar_seed: `${displayName}-${Date.now()}`, created_by: MOCK_USER_ID,
        created_at: now, updated_at: now,
      }])
      closeModal()
    } else {
      const result = await createMemberAction(groupId, displayName)
      if (result.error) setMessage(result.error)
      else { await load(); closeModal() }
    }
    setBusy(false)
  }

  async function award(memberIds: string[]) {
    const parsed = Number.parseInt(amount)
    if (!parsed || memberIds.length === 0) return
    setBusy(true)
    const category = categories.find(item => item.id === categoryId)
    const awardReason = reason.trim() || category?.name || 'Points awarded'
    if (demo) {
      const newEvents = memberIds.map((memberId, index): PointEvent => ({
        id: `demo-event-${Date.now()}-${index}`, group_id: groupId, member_id: memberId, giver_id: MOCK_USER_ID,
        amount: parsed, category_id: categoryId || null, reason: awardReason, created_at: new Date().toISOString(),
        member: members.find(member => member.id === memberId), category,
      }))
      setDemoEvents(current => [...newEvents, ...current])
      setSelectedIds([]); setSelecting(false); closeModal()
    } else {
      const results = await Promise.all(memberIds.map(memberId => awardPointsAction(groupId, memberId, parsed, categoryId || null, awardReason)))
      const error = results.find(result => result.error)?.error
      if (error) setMessage(error)
      else { await load(); setSelectedIds([]); setSelecting(false); closeModal() }
    }
    setBusy(false)
  }

  async function saveMember() {
    if (!selectedMember || !displayName.trim()) return
    setBusy(true)
    if (demo) {
      setMembers(current => current.map(member => member.id === selectedMember.id ? { ...member, display_name: displayName.trim(), status } : member))
      closeModal()
    } else {
      const result = await updateMemberAction(selectedMember.id, { display_name: displayName.trim(), status })
      if (result.error) setMessage(result.error)
      else { await load(); closeModal() }
    }
    setBusy(false)
  }

  async function changeRole() {
    if (!selectedMember?.user_id) return
    const role = selectedMember.role === 'admin' ? 'member' : 'admin'
    setBusy(true)
    if (demo) {
      setMembers(current => current.map(member => member.id === selectedMember.id ? { ...member, role } : member))
      closeModal()
    } else {
      const result = await updateMemberAction(selectedMember.id, { role })
      if (result.error) setMessage(result.error)
      else { await load(); closeModal() }
    }
    setBusy(false)
  }

  async function removeMember() {
    if (!selectedMember || !window.confirm(`Remove ${selectedMember.display_name} from the roster?`)) return
    setBusy(true)
    if (demo) {
      setMembers(current => current.filter(member => member.id !== selectedMember.id))
      setDemoEvents(current => current.filter(event => event.member_id !== selectedMember.id))
      closeModal()
    } else {
      const result = await deleteMemberAction(selectedMember.id)
      if (result.error) setMessage(result.error)
      else { await load(); closeModal() }
    }
    setBusy(false)
  }

  async function quickAward(member: GroupMember, quickAmount: number) {
    const quickReason = quickAmount > 0 ? 'Quick +1' : 'Quick −1'
    if (demo) {
      setDemoEvents(current => [{
        id: `demo-event-${Date.now()}`, group_id: groupId, member_id: member.id, giver_id: MOCK_USER_ID,
        amount: quickAmount, category_id: null, reason: quickReason, created_at: new Date().toISOString(), member,
      }, ...current])
      return
    }
    const result = await awardPointsAction(groupId, member.id, quickAmount, null, quickReason)
    if (result.error) setMessage(result.error)
    else await load()
  }

  async function undoEvent(event: PointEvent) {
    if (demo) {
      setDemoEvents(current => current.filter(item => item.id !== event.id))
      setMemberEvents(current => current.filter(item => item.id !== event.id))
      return
    }
    setBusy(true)
    const result = await undoPointEventAction(event.id)
    if (result.error) setMessage(result.error)
    else {
      setMemberEvents(current => current.filter(item => item.id !== event.id))
      await load()
    }
    setBusy(false)
  }

  async function shuffleAvatar() {
    if (!selectedMember) return
    const seed = crypto.randomUUID()
    if (demo) {
      setMembers(current => current.map(member => member.id === selectedMember.id ? { ...member, avatar_seed: seed } : member))
      setSelectedMember({ ...selectedMember, avatar_seed: seed })
      return
    }
    setBusy(true)
    const result = await updateMemberAvatarAction(selectedMember.id, seed)
    if (result.error) setMessage(result.error)
    else {
      setSelectedMember({ ...selectedMember, avatar_seed: seed })
      await load()
    }
    setBusy(false)
  }

  function chooseCategory(id: string) {
    setCategoryId(id)
    const category = categories.find(item => item.id === id)
    if (category) setAmount(String(category.default_points))
  }

  if (loading) return <LoadingState message="Opening class roster..." />

  const awardForm = (memberIds: string[]) => (
    <div className="flex flex-col gap-3">
      <Select label="Point category" value={categoryId} onChange={event => chooseCategory(event.target.value)}>
        <option value="">Custom points</option>
        {categories.map(category => <option key={category.id} value={category.id}>{category.emoji} {category.name} ({category.default_points > 0 ? '+' : ''}{category.default_points})</option>)}
      </Select>
      <Input label="Points (negative removes points)" type="number" value={amount} onChange={event => setAmount(event.target.value)} />
      <Input label="Reason" value={reason} onChange={event => setReason(event.target.value)} placeholder="What happened?" />
      {message && <p className="text-sm font-bold text-red-600">{message}</p>}
      <Button onClick={() => award(memberIds)} loading={busy} className="w-full">
        {Number(amount) < 0 ? 'Remove points' : `Award ${memberIds.length > 1 ? `${memberIds.length} members` : 'points'}`}
      </Button>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f4f3]">
      <ClassToolbar
        isAdmin={isAdmin}
        selecting={selecting}
        onAdd={() => { setDisplayName(''); setModal('add') }}
        onToggleSelect={() => { setSelecting(value => !value); setSelectedIds([]) }}
        onReset={() => window.alert('Reset bubbles is a session-display feature planned for the next pass. Point history is unchanged.')}
      />

      <section className="px-4 sm:px-7 py-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-black text-purple-500">HCWK class</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mt-1">Class Roster</h1>
            <p className="text-sm text-gray-500">{members.filter(member => member.status === 'active').length} active · {members.length} total</p>
          </div>
          {selecting && (
            <Button disabled={selectedIds.length === 0} onClick={() => setModal('multiple')} size="sm">
              Award selected ({selectedIds.length})
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState emoji="🧑‍🏫" title="No members yet"
              description="Add your first roster member — no account needed. They can claim their profile later." />
            {isAdmin && <Button onClick={() => { setDisplayName(''); setModal('add') }}>+ Add your first member</Button>}
          </div>
        ) : (
          <div className="roster-grid">
            {members.map((member, index) => (
              <RosterMemberCard key={member.id} member={member} index={index} points={points[member.id] ?? 0}
                selected={selectedIds.includes(member.id)} onClick={() => openMember(member)}
                onQuickAward={isAdmin && !selecting ? amount => quickAward(member, amount) : undefined} />
            ))}
          </div>
        )}
      </section>

      {modal === 'add' && (
        <RosterModal title="Add a roster member" subtitle="They can earn points without creating an account." onClose={closeModal}>
          <form onSubmit={addMember} className="flex flex-col gap-3">
            <Input label="Display name" value={displayName} onChange={event => setDisplayName(event.target.value)} autoFocus required />
            {message && <p className="text-sm font-bold text-red-600">{message}</p>}
            <Button type="submit" loading={busy}>Add to roster</Button>
          </form>
        </RosterModal>
      )}

      {modal === 'multiple' && (
        <RosterModal title="Award multiple members" subtitle={`${selectedIds.length} roster cards selected`} onClose={closeModal}>
          {awardForm(selectedIds)}
        </RosterModal>
      )}

      {modal === 'member' && selectedMember && (
        <RosterModal title={selectedMember.display_name} subtitle={`${selectedMember.user_id ? 'Linked account' : 'Unclaimed roster profile'} · ${points[selectedMember.id] ?? 0} points`} onClose={closeModal}>
          <div className="flex flex-col items-center gap-2 mb-4">
            <MonsterAvatar name={selectedMember.avatar_seed} size="xl" mood="happy" />
            {selectedMember.user_id === currentUserId && (
              <Button variant="ghost" size="sm" onClick={shuffleAvatar} loading={busy}>🎲 Shuffle avatar</Button>
            )}
          </div>
          {isAdmin ? (
            <div className="flex flex-col gap-5">
              {awardForm([selectedMember.id])}
              <div className="border-t border-purple-100 pt-4 flex flex-col gap-3">
                <Input label="Display name" value={displayName} onChange={event => setDisplayName(event.target.value)} />
                <Select label="Attendance / status" value={status} onChange={event => setStatus(event.target.value as GroupMember['status'])}>
                  <option value="active">Active</option><option value="absent">Absent</option><option value="inactive">Inactive</option>
                </Select>
                <Button variant="secondary" onClick={saveMember} loading={busy}>Save member details</Button>
                {selectedMember.user_id && (
                  <Button variant="secondary" onClick={changeRole} loading={busy}>
                    {selectedMember.role === 'admin' ? 'Demote to member' : 'Promote to admin'}
                  </Button>
                )}
                <Button variant="danger" onClick={removeMember} loading={busy}>Remove from roster</Button>
              </div>
              <div className="border-t border-purple-100 pt-4">
                <p className="text-xs uppercase tracking-widest font-black text-purple-500 mb-1">Point history</p>
                {memberEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No points yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {memberEvents.slice(0, 10).map(event => (
                      <ActivityItem key={event.id} event={event} onUndo={() => undoEvent(event)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : selectedMember.user_id === currentUserId ? (
            <div>
              <p className="text-xs uppercase tracking-widest font-black text-purple-500 mb-1">Your point history</p>
              {memberEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No points yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {memberEvents.slice(0, 10).map(event => <ActivityItem key={event.id} event={event} />)}
                </div>
              )}
              {message && <p className="text-sm font-bold text-red-600 mt-2">{message}</p>}
            </div>
          ) : <p className="text-center text-sm text-gray-500">Only admins can manage roster members and points.</p>}
          <div className="mt-4 text-center">
            <Link href={`/groups/${groupId}/members/${selectedMember.id}`} className="text-xs font-bold text-purple-500 hover:underline">
              View full profile →
            </Link>
          </div>
        </RosterModal>
      )}
    </div>
  )
}

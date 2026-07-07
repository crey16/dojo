'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminActionCard } from '@/components/AdminActionCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { AvatarDisc } from '@/components/MonsterAvatar'
import { Confetti } from '@/components/Confetti'
import { CategoryIcon } from '@/components/CategoryIcon'
import { PointBubble } from '@/components/PointBubble'
import { LoadingState } from '@/components/ui/LoadingState'
import { getGroupMembers, getMemberRole } from '@/lib/data/members'
import { getPointCategories, getRecentActivity } from '@/lib/data/points'
import { getRewards, getRedemptions } from '@/lib/data/rewards'
import { getChallenges, getSubmissions } from '@/lib/data/challenges'
import { getCurrentUserId } from '@/lib/data/auth'
import { getGroup } from '@/lib/data/groups'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { awardPointsAction, undoPointEventAction, createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/points'
import { createRewardAction, updateRewardAction, deleteRewardAction, updateRedemptionStatusAction } from '@/app/actions/rewards'
import { createChallengeAction, updateChallengeAction, deleteChallengeAction, updateSubmissionStatusAction } from '@/app/actions/challenges'
import { formatRelativeTime } from '@/lib/utils'
import type { GroupMember, PointCategory, Reward, RewardRedemption, Challenge, ChallengeSubmission, PointEvent } from '@/lib/types'

type AdminTab = 'points' | 'rewards' | 'challenges' | 'members' | 'activity'

export default function AdminPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string

  const [tab, setTab] = useState<AdminTab>('points')
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [categories, setCategories] = useState<PointCategory[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([])
  const [activity, setActivity] = useState<PointEvent[]>([])
  const [confetti, setConfetti] = useState(false)
  const [loading, setLoading] = useState(true)

  // Award points state
  const [awardMember, setAwardMember] = useState('')
  const [awardCategory, setAwardCategory] = useState('')
  const [awardAmount, setAwardAmount] = useState('')
  const [awardReason, setAwardReason] = useState('')
  const [awardLoading, setAwardLoading] = useState(false)
  const [awardMsg, setAwardMsg] = useState('')

  // Create reward state
  const [rewardTitle, setRewardTitle] = useState('')
  const [rewardDesc, setRewardDesc] = useState('')
  const [rewardCost, setRewardCost] = useState('')
  const [rewardLoading, setRewardLoading] = useState(false)
  const [rewardMsg, setRewardMsg] = useState('')

  // Edit reward state
  const [editReward, setEditReward] = useState<Reward | null>(null)
  const [confirmDeleteReward, setConfirmDeleteReward] = useState('')

  // Create challenge state
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')
  const [challengePoints, setChallengePoints] = useState('')
  const [challengeDue, setChallengeDue] = useState('')
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [challengeMsg, setChallengeMsg] = useState('')

  // Edit challenge state
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null)
  const [confirmDeleteChallenge, setConfirmDeleteChallenge] = useState('')

  // Invite code
  const [inviteCode, setInviteCode] = useState('')

  // Category management state
  const [catName, setCatName] = useState('')
  const [catPoints, setCatPoints] = useState('')
  const [catBusy, setCatBusy] = useState(false)
  const [catMsg, setCatMsg] = useState('')
  const [editCat, setEditCat] = useState<PointCategory | null>(null)
  const [confirmDeleteCat, setConfirmDeleteCat] = useState('')

  useEffect(() => {
    async function load() {
      const uid = await getCurrentUserId()
      setUserId(uid)
      const role = await getMemberRole(groupId, uid)
      if (role !== 'admin') {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setIsAdmin(true)

      const [m, cats, rws, redemps, chs, subs, act, group] = await Promise.all([
        getGroupMembers(groupId),
        getPointCategories(groupId),
        getRewards(groupId),
        getRedemptions(groupId),
        getChallenges(groupId),
        getSubmissions(groupId),
        getRecentActivity(groupId, 30),
        getGroup(groupId),
      ])
      setMembers(m)
      setCategories(cats)
      setRewards(rws)
      setRedemptions(redemps)
      setChallenges(chs)
      setSubmissions(subs)
      setActivity(act)
      setInviteCode(group?.invite_code ?? '')
      setLoading(false)
    }
    load()
  }, [groupId])

  async function handleAwardPoints(e: React.FormEvent) {
    e.preventDefault()
    if (!awardMember) return
    setAwardLoading(true)

    const category = categories.find(c => c.id === awardCategory)
    const amount = parseInt(awardAmount) || category?.default_points || 0
    const reason = awardReason.trim() || category?.name || 'Points awarded'
    const positive = amount > 0

    const { error } = isSupabaseConfigured()
      ? await awardPointsAction(groupId, awardMember, amount, awardCategory || null, reason)
      : { error: null }

    if (!error) {
      if (positive) setConfetti(true)
      setAwardMsg(positive ? `+${amount} points awarded!` : `${amount} points removed.`)
      setAwardMember('')
      setAwardCategory('')
      setAwardAmount('')
      setAwardReason('')
      const act = await getRecentActivity(groupId, 30)
      setActivity(act)
    } else {
      setAwardMsg(`Error: ${error}`)
    }
    setAwardLoading(false)
  }

  async function handleUndoEvent(eventId: string) {
    const { error } = await undoPointEventAction(eventId)
    if (error) setAwardMsg(`Error: ${error}`)
    else setActivity(await getRecentActivity(groupId, 30))
  }

  async function reloadCategories() {
    setCategories(await getPointCategories(groupId))
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    setCatBusy(true)
    setCatMsg('')
    const { error } = isSupabaseConfigured()
      ? await createCategoryAction(groupId, catName, parseInt(catPoints) || 0)
      : { error: null }
    if (error) setCatMsg(error)
    else {
      setCatName(''); setCatPoints('')
      await reloadCategories()
    }
    setCatBusy(false)
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!editCat) return
    setCatBusy(true)
    setCatMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateCategoryAction(editCat.id, editCat.name, editCat.default_points)
      : { error: null }
    if (error) setCatMsg(error)
    else {
      setEditCat(null)
      await reloadCategories()
    }
    setCatBusy(false)
  }

  async function handleDeleteCategory(id: string) {
    setCatMsg('')
    setConfirmDeleteCat('')
    const { error } = isSupabaseConfigured()
      ? await deleteCategoryAction(id)
      : { error: null }
    if (error) setCatMsg(error)
    else await reloadCategories()
  }

  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault()
    setRewardLoading(true)
    const { error } = isSupabaseConfigured()
      ? await createRewardAction(groupId, { title: rewardTitle, description: rewardDesc, cost: parseInt(rewardCost), active: true })
      : { error: null }
    if (!error) {
      setRewardTitle(''); setRewardDesc(''); setRewardCost('')
      const rws = await getRewards(groupId)
      setRewards(rws)
    }
    setRewardLoading(false)
  }

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault()
    setChallengeLoading(true)
    const { error } = isSupabaseConfigured()
      ? await createChallengeAction(groupId, { title: challengeTitle, description: challengeDesc, points: parseInt(challengePoints), due_date: challengeDue || null, active: true, created_by: userId })
      : { error: null }
    if (!error) {
      setChallengeTitle(''); setChallengeDesc(''); setChallengePoints(''); setChallengeDue('')
      const chs = await getChallenges(groupId)
      setChallenges(chs)
    }
    setChallengeLoading(false)
  }

  async function handleSaveReward(e: React.FormEvent) {
    e.preventDefault()
    if (!editReward) return
    setRewardMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateRewardAction(editReward.id, {
          title: editReward.title,
          description: editReward.description,
          cost: editReward.cost,
        })
      : { error: null }
    if (error) { setRewardMsg(error); return }
    setEditReward(null)
    setRewards(await getRewards(groupId))
  }

  async function handleToggleReward(r: Reward) {
    setRewardMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateRewardAction(r.id, { active: !r.active })
      : { error: null }
    if (error) setRewardMsg(error)
    else setRewards(await getRewards(groupId))
  }

  async function handleDeleteReward(id: string) {
    setRewardMsg('')
    setConfirmDeleteReward('')
    const { error } = isSupabaseConfigured()
      ? await deleteRewardAction(id)
      : { error: null }
    if (error) setRewardMsg(error)
    else setRewards(await getRewards(groupId))
  }

  async function handleSaveChallenge(e: React.FormEvent) {
    e.preventDefault()
    if (!editChallenge) return
    setChallengeMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateChallengeAction(editChallenge.id, {
          title: editChallenge.title,
          description: editChallenge.description,
          points: editChallenge.points,
          due_date: editChallenge.due_date,
        })
      : { error: null }
    if (error) { setChallengeMsg(error); return }
    setEditChallenge(null)
    setChallenges(await getChallenges(groupId))
  }

  async function handleToggleChallenge(c: Challenge) {
    setChallengeMsg('')
    const { error } = isSupabaseConfigured()
      ? await updateChallengeAction(c.id, { active: !c.active })
      : { error: null }
    if (error) setChallengeMsg(error)
    else setChallenges(await getChallenges(groupId))
  }

  async function handleDeleteChallenge(id: string) {
    setChallengeMsg('')
    setConfirmDeleteChallenge('')
    const { error } = isSupabaseConfigured()
      ? await deleteChallengeAction(id)
      : { error: null }
    if (error) setChallengeMsg(error)
    else setChallenges(await getChallenges(groupId))
  }

  async function handleRedemptionStatus(id: string, status: 'approved' | 'denied') {
    if (isSupabaseConfigured()) await updateRedemptionStatusAction(id, status)
    const redemps = await getRedemptions(groupId)
    setRedemptions(redemps)
  }

  async function handleSubmissionStatus(sub: ChallengeSubmission, status: 'approved' | 'denied') {
    if (isSupabaseConfigured()) await updateSubmissionStatusAction(sub.id, status)
    const subs = await getSubmissions(groupId)
    setSubmissions(subs)
    if (status === 'approved') setConfetti(true)
  }

  if (loading) return <LoadingState />

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center">
        <h2 className="font-display font-bold text-2xl text-ink">Admins only</h2>
        <p className="text-[13px] font-bold text-muted">Only admins can access this page.</p>
        <Button onClick={() => router.back()} variant="secondary">Go back</Button>
      </div>
    )
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'points', label: 'Points' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'challenges', label: 'Quests' },
    { id: 'members', label: 'Members' },
    { id: 'activity', label: 'Activity' },
  ]

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending')
  const pendingSubmissions = submissions.filter(s => s.status === 'pending')

  return (
    <div className="flex flex-col gap-4">
      <Confetti trigger={confetti} onComplete={() => setConfetti(false)} />

      <PageHeader title="Admin panel" subtitle="You run this dojo" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-shell p-1 rounded-full overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              tab === t.id ? 'bg-white text-primary shadow-[0_2px_6px_rgba(0,0,0,0.08)]' : 'text-muted hover:text-body'
            }`}
          >
            {t.label}
            {t.id === 'rewards' && pendingRedemptions.length > 0 && (
              <span className="bg-negative-soft text-negative-ink rounded-full min-w-4 h-4 px-1 text-[10px] font-black flex items-center justify-center">{pendingRedemptions.length}</span>
            )}
            {t.id === 'challenges' && pendingSubmissions.length > 0 && (
              <span className="bg-negative-soft text-negative-ink rounded-full min-w-4 h-4 px-1 text-[10px] font-black flex items-center justify-center">{pendingSubmissions.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* POINTS TAB */}
      {tab === 'points' && (
        <div className="flex flex-col gap-4">
        <AdminActionCard
          title="Award or remove points"
          description="Choose a member, category, and amount."
        >
          {awardMsg && (
            <div className={`p-3 rounded-[14px] text-[13px] font-extrabold flex items-center gap-2 ${awardMsg.includes('Error') ? 'bg-negative-soft text-negative-ink' : 'bg-positive-soft text-positive-ink'}`}>
              <span className="flex-1">{awardMsg}</span>
              <button type="button" onClick={() => setAwardMsg('')} aria-label="Dismiss" className="font-black cursor-pointer px-1.5">✕</button>
            </div>
          )}
          <form onSubmit={handleAwardPoints} className="flex flex-col gap-3">
            <Select
              label="Member"
              value={awardMember}
              onChange={e => setAwardMember(e.target.value)}
              required
            >
              <option value="">Select a member...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </Select>

            <Select
              label="Category"
              value={awardCategory}
              onChange={e => {
                setAwardCategory(e.target.value)
                const cat = categories.find(c => c.id === e.target.value)
                if (cat) setAwardAmount(String(cat.default_points))
              }}
            >
              <option value="">Custom / No category</option>
              <optgroup label="Positive">
                {categories.filter(c => c.type === 'positive').map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.default_points > 0 ? '+' : ''}{c.default_points})</option>
                ))}
              </optgroup>
              <optgroup label="Negative">
                {categories.filter(c => c.type === 'negative').map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.default_points})</option>
                ))}
              </optgroup>
            </Select>

            <Input
              label="Points (negative to remove)"
              type="number"
              placeholder="e.g. 5 or -7"
              value={awardAmount}
              onChange={e => setAwardAmount(e.target.value)}
              required
            />

            <Input
              label="Reason (optional)"
              placeholder="What did they do?"
              value={awardReason}
              onChange={e => setAwardReason(e.target.value)}
            />

            <Button type="submit" loading={awardLoading} size="lg" className="w-full">
              {parseInt(awardAmount) < 0 ? 'Remove points' : 'Award points'}
            </Button>
          </form>
        </AdminActionCard>

        <AdminActionCard
          title="Point categories"
          description="The shortcuts everyone sees. Edit values, rename, or add your own — use negative points for penalties."
        >
          {catMsg && (
            <div className="bg-negative-soft rounded-[14px] p-2.5 text-xs font-extrabold text-negative-ink">{catMsg}</div>
          )}
          <form onSubmit={handleCreateCategory} className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <Input label="New category" placeholder="e.g. Legendary Assist" value={catName} onChange={e => setCatName(e.target.value)} required />
            </div>
            <div className="w-24 flex-none">
              <Input label="Points" type="number" placeholder="+5 / -3" value={catPoints} onChange={e => setCatPoints(e.target.value)} required />
            </div>
            <Button type="submit" loading={catBusy} className="flex-none">Add</Button>
          </form>

          <div>
            {categories.map(c => (
              <div key={c.id} className="py-2 border-b border-hairline last:border-0">
                {editCat?.id === c.id ? (
                  <form onSubmit={handleSaveCategory} className="flex gap-2 items-end py-1">
                    <div className="flex-1 min-w-0">
                      <Input label="Name" value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} required />
                    </div>
                    <div className="w-24 flex-none">
                      <Input label="Points" type="number" value={String(editCat.default_points)} onChange={e => setEditCat({ ...editCat, default_points: parseInt(e.target.value) || 0 })} required />
                    </div>
                    <Button type="submit" size="sm" loading={catBusy} className="flex-none">Save</Button>
                    <Button type="button" size="sm" variant="ghost" className="flex-none" onClick={() => setEditCat(null)}>Cancel</Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <CategoryIcon name={c.name} positive={c.default_points > 0} />
                    <span className="flex-1 min-w-0 font-extrabold text-[13.5px] text-ink truncate">{c.name}</span>
                    <PointBubble points={c.default_points} showSign />
                    <Button variant="ghost" size="sm" onClick={() => { setConfirmDeleteCat(''); setEditCat(c) }} aria-label={`Edit ${c.name}`}><Icon name="edit" size={16} /></Button>
                    {confirmDeleteCat === c.id ? (
                      <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(c.id)}>Really delete?</Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteCat(c.id)} aria-label={`Delete ${c.name}`}><Icon name="trash" size={16} /></Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11.5px] font-bold text-muted">Deleting a category keeps everyone&apos;s past points — old events just lose the label.</p>
        </AdminActionCard>
        </div>
      )}

      {/* REWARDS TAB */}
      {tab === 'rewards' && (
        <div className="flex flex-col gap-4">
          <AdminActionCard
            title="Create reward"
            description="Add a new reward members can redeem."
          >
            <form onSubmit={handleCreateReward} className="flex flex-col gap-3">
              <Input label="Title" placeholder="Pick the Movie" value={rewardTitle} onChange={e => setRewardTitle(e.target.value)} required />
              <Textarea label="Description" placeholder="What does this reward get you?" value={rewardDesc} onChange={e => setRewardDesc(e.target.value)} rows={2} />
              <Input label="Point Cost" type="number" placeholder="20" value={rewardCost} onChange={e => setRewardCost(e.target.value)} required />
              <Button type="submit" loading={rewardLoading} className="w-full">Create reward</Button>
            </form>
          </AdminActionCard>

          {pendingRedemptions.length > 0 && (
            <AdminActionCard title="Needs review" description="Approve or deny redemption requests.">
              <div className="flex flex-col gap-2">
                {pendingRedemptions.map(r => (
                  <div key={r.id} className="rounded-[18px] p-3.5 bg-canvas">
                    <div className="flex items-center gap-2.5 mb-3">
                      <AvatarDisc name={r.profile?.display_name ?? 'Unknown'} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-black text-ink truncate">{r.profile?.display_name} wants “{r.reward?.title}”</p>
                        <p className="text-xs font-bold text-muted">Reward redemption</p>
                      </div>
                      <span className="bg-primary-soft text-primary-dark rounded-full px-2.5 py-1 font-black text-xs tabular-nums flex-none">−{r.reward?.cost}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleRedemptionStatus(r.id, 'approved')}>Approve</Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => handleRedemptionStatus(r.id, 'denied')}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminActionCard>
          )}

          <div>
            <h3 className="font-display font-bold text-base text-ink mb-2">All rewards ({rewards.length})</h3>
            {rewardMsg && (
              <div className="bg-negative-soft rounded-[14px] p-2.5 mb-2 text-xs font-extrabold text-negative-ink">{rewardMsg}</div>
            )}
            {rewards.length === 0 && (
              <p className="text-[13px] font-bold text-muted py-4 text-center">No rewards yet — create one above.</p>
            )}
            {rewards.map(r => (
              <div key={r.id} className="card p-3 mb-2">
                {editReward?.id === r.id ? (
                  <form onSubmit={handleSaveReward} className="flex flex-col gap-2">
                    <Input label="Title" value={editReward.title} onChange={e => setEditReward({ ...editReward, title: e.target.value })} required />
                    <Textarea label="Description" value={editReward.description} onChange={e => setEditReward({ ...editReward, description: e.target.value })} rows={2} />
                    <Input label="Point Cost" type="number" value={String(editReward.cost)} onChange={e => setEditReward({ ...editReward, cost: parseInt(e.target.value) || 0 })} required />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1">Save</Button>
                      <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setEditReward(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-ink truncate">{r.title}</p>
                      <p className="text-xs font-bold text-muted tabular-nums">{r.cost} pts</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant={r.active ? 'green' : 'gray'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => { setConfirmDeleteReward(''); setEditReward(r) }}><Icon name="edit" size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleReward(r)}>{r.active ? <Icon name="pause" size={16} /> : <Icon name="play" size={16} />}</Button>
                      {confirmDeleteReward === r.id ? (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteReward(r.id)}>Really delete?</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteReward(r.id)}><Icon name="trash" size={16} /></Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {tab === 'challenges' && (
        <div className="flex flex-col gap-4">
          <AdminActionCard
            title="Create challenge"
            description="Add a new quest for members to complete."
          >
            <form onSubmit={handleCreateChallenge} className="flex flex-col gap-3">
              <Input label="Title" placeholder="Send a voice memo" value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} required />
              <Textarea label="Description" placeholder="What do they need to do?" value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)} rows={2} />
              <Input label="Points Reward" type="number" placeholder="10" value={challengePoints} onChange={e => setChallengePoints(e.target.value)} required />
              <Input label="Due Date (optional)" type="date" value={challengeDue} onChange={e => setChallengeDue(e.target.value)} />
              <Button type="submit" loading={challengeLoading} className="w-full">Create challenge</Button>
            </form>
          </AdminActionCard>

          {pendingSubmissions.length > 0 && (
            <AdminActionCard title="Needs review" description="Review challenge submissions.">
              <div className="flex flex-col gap-2">
                {pendingSubmissions.map(s => (
                  <div key={s.id} className="rounded-[18px] p-3.5 bg-canvas">
                    <div className="flex items-center gap-2.5 mb-1">
                      <AvatarDisc name={s.profile?.display_name ?? 'Unknown'} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-black text-ink truncate">{s.profile?.display_name} · {s.challenge?.title}</p>
                        {s.proof_text && <p className="text-xs font-bold text-[#6B7280] truncate">&ldquo;{s.proof_text}&rdquo;</p>}
                      </div>
                      <span className="bg-positive-soft text-positive-ink rounded-full px-2.5 py-1 font-black text-xs tabular-nums flex-none">+{s.challenge?.points}</span>
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <Button size="sm" className="flex-1" onClick={() => handleSubmissionStatus(s, 'approved')}>Approve</Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => handleSubmissionStatus(s, 'denied')}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminActionCard>
          )}

          <div>
            <h3 className="font-display font-bold text-base text-ink mb-2">All challenges ({challenges.length})</h3>
            {challengeMsg && (
              <div className="bg-negative-soft rounded-[14px] p-2.5 mb-2 text-xs font-extrabold text-negative-ink">{challengeMsg}</div>
            )}
            {challenges.length === 0 && (
              <p className="text-[13px] font-bold text-muted py-4 text-center">No challenges yet — create one above.</p>
            )}
            {challenges.map(c => (
              <div key={c.id} className="card p-3 mb-2">
                {editChallenge?.id === c.id ? (
                  <form onSubmit={handleSaveChallenge} className="flex flex-col gap-2">
                    <Input label="Title" value={editChallenge.title} onChange={e => setEditChallenge({ ...editChallenge, title: e.target.value })} required />
                    <Textarea label="Description" value={editChallenge.description} onChange={e => setEditChallenge({ ...editChallenge, description: e.target.value })} rows={2} />
                    <Input label="Points Reward" type="number" value={String(editChallenge.points)} onChange={e => setEditChallenge({ ...editChallenge, points: parseInt(e.target.value) || 0 })} required />
                    <Input label="Due Date (optional)" type="date" value={editChallenge.due_date?.slice(0, 10) ?? ''} onChange={e => setEditChallenge({ ...editChallenge, due_date: e.target.value || null })} />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1">Save</Button>
                      <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setEditChallenge(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-ink truncate">{c.title}</p>
                      <p className="text-xs font-bold text-muted tabular-nums">{c.points} pts{c.due_date ? ` · due ${c.due_date.slice(0, 10)}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant={c.active ? 'green' : 'gray'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => { setConfirmDeleteChallenge(''); setEditChallenge(c) }}><Icon name="edit" size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleChallenge(c)}>{c.active ? <Icon name="pause" size={16} /> : <Icon name="play" size={16} />}</Button>
                      {confirmDeleteChallenge === c.id ? (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteChallenge(c.id)}>Really delete?</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteChallenge(c.id)}><Icon name="trash" size={16} /></Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {inviteCode && (
              <div className="card p-3.5">
                <p className="text-[11px] font-extrabold text-muted tracking-wide">INVITE CODE</p>
                <p className="font-display font-bold text-xl text-primary tracking-[0.06em] mt-0.5">{inviteCode}</p>
              </div>
            )}
            <div className="card p-3.5">
              <p className="text-[11px] font-extrabold text-muted tracking-wide">MEMBERS</p>
              <p className="font-display font-bold text-xl text-ink mt-0.5">
                {members.length}
                <span className="text-xs font-sans font-bold text-muted"> · {members.filter(m => !m.user_id).length} unclaimed</span>
              </p>
            </div>
          </div>

          <div className="card px-4 py-1.5">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-0">
                <AvatarDisc name={m.avatar_seed || m.display_name} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-ink truncate">{m.display_name}</p>
                  <p className="text-xs font-bold text-muted truncate">{m.user_id ? m.profile?.email : 'Unclaimed roster member'}</p>
                </div>
                <Badge variant={m.role === 'admin' ? 'purple' : 'gray'}>{m.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === 'activity' && (
        <div>
          <h3 className="font-display font-bold text-base text-ink mb-2.5">Recent activity</h3>
          <div className="card px-4 py-1.5">
            {activity.length === 0 ? (
              <p className="py-8 text-center text-[13px] font-bold text-muted">No activity yet</p>
            ) : (
              activity.map(event => (
                <div key={event.id} className="flex items-center gap-3 py-3 border-b border-hairline last:border-0">
                  <AvatarDisc name={event.member?.avatar_seed || event.member?.display_name || 'Unknown'} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-extrabold text-ink truncate">
                      {event.member?.display_name} · {event.reason}
                    </p>
                    <p className="text-[11.5px] font-bold text-muted">{formatRelativeTime(event.created_at)}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center rounded-full font-black tabular-nums text-xs px-2.5 py-1 flex-none ${event.amount >= 0 ? 'bg-positive-soft text-positive-ink' : 'bg-negative-soft text-negative-ink'}`}>
                    {event.amount >= 0 ? '+' : '−'}{Math.abs(event.amount)}
                  </span>
                  {isSupabaseConfigured() && (
                    <button
                      type="button"
                      onClick={() => handleUndoEvent(event.id)}
                      title="Undo this point event"
                      className="text-xs font-black text-primary hover:text-primary-dark hover:bg-primary-soft rounded-full px-2.5 py-1 cursor-pointer"
                    >
                      Undo
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

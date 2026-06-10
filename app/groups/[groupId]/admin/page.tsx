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
import { MonsterAvatar } from '@/components/MonsterAvatar'
import { Confetti } from '@/components/Confetti'
import { LoadingState } from '@/components/ui/LoadingState'
import { getGroupMembers, getMemberRole } from '@/lib/data/members'
import { getPointCategories, getRecentActivity } from '@/lib/data/points'
import { getRewards, getRedemptions } from '@/lib/data/rewards'
import { getChallenges, getSubmissions } from '@/lib/data/challenges'
import { getCurrentUserId } from '@/lib/data/auth'
import { getGroup } from '@/lib/data/groups'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { awardPointsAction } from '@/app/actions/points'
import { createRewardAction, updateRedemptionStatusAction } from '@/app/actions/rewards'
import { createChallengeAction, updateSubmissionStatusAction } from '@/app/actions/challenges'
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

  // Create challenge state
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')
  const [challengePoints, setChallengePoints] = useState('')
  const [challengeDue, setChallengeDue] = useState('')
  const [challengeLoading, setChallengeLoading] = useState(false)

  // Invite code
  const [inviteCode, setInviteCode] = useState('')

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
      setAwardMsg(positive ? `✅ Good Job! +${amount} points awarded!` : `😬 Uh Oh! ${amount} points removed.`)
      setAwardMember('')
      setAwardCategory('')
      setAwardAmount('')
      setAwardReason('')
      const act = await getRecentActivity(groupId, 30)
      setActivity(act)
    } else {
      setAwardMsg(`❌ Error: ${error}`)
    }
    setAwardLoading(false)
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

  async function handleRedemptionStatus(id: string, status: 'approved' | 'denied') {
    if (isSupabaseConfigured()) await updateRedemptionStatusAction(id, status)
    const redemps = await getRedemptions(groupId)
    setRedemptions(redemps)
  }

  async function handleSubmissionStatus(sub: ChallengeSubmission, status: 'approved' | 'denied') {
    if (isSupabaseConfigured()) await updateSubmissionStatusAction(sub.id, status, groupId, sub.user_id, sub.challenge?.points ?? 0)
    const subs = await getSubmissions(groupId)
    setSubmissions(subs)
    if (status === 'approved') setConfetti(true)
  }

  if (loading) return <LoadingState />

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <span className="text-6xl">🚫</span>
        <h2 className="text-2xl font-black text-red-700">Access Denied</h2>
        <p className="text-gray-500">Only admins can access this page.</p>
        <Button onClick={() => router.back()} variant="secondary">Go Back</Button>
      </div>
    )
  }

  const tabs: { id: AdminTab; label: string; emoji: string }[] = [
    { id: 'points', label: 'Points', emoji: '⭐' },
    { id: 'rewards', label: 'Rewards', emoji: '🎁' },
    { id: 'challenges', label: 'Quests', emoji: '⚔️' },
    { id: 'members', label: 'Members', emoji: '👥' },
    { id: 'activity', label: 'Activity', emoji: '📋' },
  ]

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending')
  const pendingSubmissions = submissions.filter(s => s.status === 'pending')

  return (
    <div className="flex flex-col gap-6">
      <Confetti trigger={confetti} onComplete={() => setConfetti(false)} />

      <PageHeader title="Admin Panel" emoji="👑" subtitle="You run this dojo." />

      {/* Tab bar */}
      <div className="flex gap-1 bg-purple-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-500'
            }`}
          >
            {t.emoji} {t.label}
            {t.id === 'rewards' && pendingRedemptions.length > 0 && (
              <span className="bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{pendingRedemptions.length}</span>
            )}
            {t.id === 'challenges' && pendingSubmissions.length > 0 && (
              <span className="bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{pendingSubmissions.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* POINTS TAB */}
      {tab === 'points' && (
        <AdminActionCard
          title="Award / Remove Points"
          description="Choose a member, category, and amount."
          emoji="⭐"
          color="bg-purple-50 border-purple-200"
        >
          {awardMsg && (
            <div className={`p-3 rounded-xl border-2 text-sm font-bold ${awardMsg.includes('Error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              {awardMsg}
              <Button variant="ghost" size="sm" onClick={() => setAwardMsg('')} className="ml-2">✕</Button>
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
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.display_name ?? m.user_id}
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
                  <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.default_points > 0 ? '+' : ''}{c.default_points})</option>
                ))}
              </optgroup>
              <optgroup label="Negative">
                {categories.filter(c => c.type === 'negative').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.default_points})</option>
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
              {parseInt(awardAmount) < 0 ? '😈 Remove Points' : '🎉 Award Points!'}
            </Button>
          </form>
        </AdminActionCard>
      )}

      {/* REWARDS TAB */}
      {tab === 'rewards' && (
        <div className="flex flex-col gap-4">
          <AdminActionCard
            title="Create Reward"
            description="Add a new reward members can redeem."
            emoji="🎁"
            color="bg-pink-50 border-pink-200"
          >
            <form onSubmit={handleCreateReward} className="flex flex-col gap-3">
              <Input label="Title" placeholder="Pick the Movie" value={rewardTitle} onChange={e => setRewardTitle(e.target.value)} required />
              <Textarea label="Description" placeholder="What does this reward get you?" value={rewardDesc} onChange={e => setRewardDesc(e.target.value)} rows={2} />
              <Input label="Point Cost" type="number" placeholder="20" value={rewardCost} onChange={e => setRewardCost(e.target.value)} required />
              <Button type="submit" loading={rewardLoading} className="w-full">✅ Create Reward</Button>
            </form>
          </AdminActionCard>

          {pendingRedemptions.length > 0 && (
            <AdminActionCard title="Pending Redemptions" description="Approve or deny member requests." emoji="⏳" color="bg-yellow-50 border-yellow-200">
              <div className="flex flex-col gap-2">
                {pendingRedemptions.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MonsterAvatar name={r.profile?.display_name ?? 'Unknown'} size="xs" />
                      <div>
                        <p className="text-xs font-black text-gray-800">{r.profile?.display_name}</p>
                        <p className="text-xs text-gray-500">wants: {r.reward?.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm" className="flex-1" onClick={() => handleRedemptionStatus(r.id, 'approved')}>✅ Approve</Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => handleRedemptionStatus(r.id, 'denied')}>❌ Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminActionCard>
          )}

          <div>
            <h3 className="font-black text-purple-900 mb-2">All Rewards ({rewards.length})</h3>
            {rewards.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-purple-100 p-3 mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{r.title}</p>
                  <p className="text-xs text-gray-400">⭐ {r.cost} pts</p>
                </div>
                <Badge variant={r.active ? 'green' : 'gray'}>{r.active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {tab === 'challenges' && (
        <div className="flex flex-col gap-4">
          <AdminActionCard
            title="Create Challenge"
            description="Add a new quest for members to complete."
            emoji="⚔️"
            color="bg-blue-50 border-blue-200"
          >
            <form onSubmit={handleCreateChallenge} className="flex flex-col gap-3">
              <Input label="Title" placeholder="Send a voice memo" value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} required />
              <Textarea label="Description" placeholder="What do they need to do?" value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)} rows={2} />
              <Input label="Points Reward" type="number" placeholder="10" value={challengePoints} onChange={e => setChallengePoints(e.target.value)} required />
              <Input label="Due Date (optional)" type="date" value={challengeDue} onChange={e => setChallengeDue(e.target.value)} />
              <Button type="submit" loading={challengeLoading} className="w-full">⚔️ Create Challenge</Button>
            </form>
          </AdminActionCard>

          {pendingSubmissions.length > 0 && (
            <AdminActionCard title="Pending Submissions" description="Review challenge submissions." emoji="📬" color="bg-yellow-50 border-yellow-200">
              <div className="flex flex-col gap-2">
                {pendingSubmissions.map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MonsterAvatar name={s.profile?.display_name ?? 'Unknown'} size="xs" />
                      <div>
                        <p className="text-xs font-black text-gray-800">{s.profile?.display_name}</p>
                        <p className="text-xs text-gray-500">{s.challenge?.title}</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-purple-600">+{s.challenge?.points} pts</span>
                    </div>
                    {s.proof_text && <p className="text-xs text-gray-600 italic mb-2">"{s.proof_text}"</p>}
                    <div className="flex gap-2">
                      <Button variant="success" size="sm" className="flex-1" onClick={() => handleSubmissionStatus(s, 'approved')}>✅ Approve</Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => handleSubmissionStatus(s, 'denied')}>❌ Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminActionCard>
          )}

          <div>
            <h3 className="font-black text-purple-900 mb-2">All Challenges ({challenges.length})</h3>
            {challenges.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-purple-100 p-3 mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{c.title}</p>
                  <p className="text-xs text-gray-400">✨ {c.points} pts</p>
                </div>
                <Badge variant={c.active ? 'green' : 'gray'}>{c.active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div className="flex flex-col gap-4">
          {inviteCode && (
            <AdminActionCard title="Invite Code" description="Share this with friends to join the group." emoji="🔑" color="bg-green-50 border-green-200">
              <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
                <p className="text-3xl font-black tracking-widest text-green-700">{inviteCode}</p>
              </div>
            </AdminActionCard>
          )}

          <div>
            <h3 className="font-black text-purple-900 mb-2">Members ({members.length})</h3>
            {members.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-purple-100 p-3 mb-2 flex items-center gap-2">
                <MonsterAvatar name={m.profile?.display_name ?? 'Unknown'} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{m.profile?.display_name}</p>
                  <p className="text-xs text-gray-400">{m.profile?.email}</p>
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
          <h3 className="font-black text-purple-900 mb-3">Recent Activity</h3>
          <div className="bg-white rounded-2xl border-2 border-purple-100 px-4">
            {activity.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No activity yet</div>
            ) : (
              activity.map(event => (
                <div key={event.id} className="flex items-center gap-3 py-3 border-b border-purple-50 last:border-0">
                  <MonsterAvatar name={event.profile?.display_name ?? 'Unknown'} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {event.profile?.display_name} · {event.category?.emoji} {event.reason}
                    </p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(event.created_at)}</p>
                  </div>
                  <span className={`text-sm font-black ${event.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {event.amount >= 0 ? '+' : ''}{event.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

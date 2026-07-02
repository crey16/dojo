import type {
  Group,
  GroupMember,
  PointCategory,
  PointEvent,
  Reward,
  RewardRedemption,
  Challenge,
  ChallengeSubmission,
  LeaderboardEntry,
  Profile,
} from './types'

export const MOCK_GROUP_ID = 'mock-group-hcwk'
export const MOCK_USER_ID = 'mock-user-you'

export const MOCK_PROFILES: Profile[] = [
  { id: MOCK_USER_ID, email: 'you@hcwk.app', display_name: 'Collin', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mock-user-kaison', email: 'kaison@hcwk.app', display_name: 'Kaison', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mock-user-alex', email: 'alex@hcwk.app', display_name: 'Alex', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mock-user-jordan', email: 'jordan@hcwk.app', display_name: 'Jordan', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mock-user-maya', email: 'maya@hcwk.app', display_name: 'Maya', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mock-user-sam', email: 'sam@hcwk.app', display_name: 'Sam', created_at: '2024-01-01T00:00:00Z' },
]

export const MOCK_GROUP: Group = {
  id: MOCK_GROUP_ID,
  name: 'HCWK',
  invite_code: 'HCWK42',
  created_by: MOCK_USER_ID,
  created_at: '2024-01-01T00:00:00Z',
}

const mockMember = (id: string, display_name: string, user_id: string | null = null, role: 'admin' | 'member' = 'member', status: 'active' | 'inactive' | 'absent' = 'active'): GroupMember => ({
  id, group_id: MOCK_GROUP_ID, user_id, display_name, role, status, avatar_seed: display_name,
  created_by: MOCK_USER_ID, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  profile: user_id ? MOCK_PROFILES.find(profile => profile.id === user_id) : undefined,
})

export const MOCK_MEMBERS: GroupMember[] = [
  mockMember('gm-1', 'Collin', MOCK_USER_ID, 'admin'),
  mockMember('gm-2', 'Kaison', 'mock-user-kaison'),
  mockMember('gm-3', 'Alex', 'mock-user-alex'),
  mockMember('gm-4', 'Jayden'),
  mockMember('gm-5', 'Ryan'),
  mockMember('gm-6', 'Brandon'),
  mockMember('gm-7', 'Ethan'),
  mockMember('gm-8', 'Jason'),
  mockMember('gm-9', 'Daniel'),
  mockMember('gm-10', 'Marcus'),
  mockMember('gm-11', 'Justin'),
  mockMember('gm-12', 'Tyler', null, 'member', 'absent'),
  mockMember('gm-13', 'Jordan', 'mock-user-jordan'),
  mockMember('gm-14', 'Maya', 'mock-user-maya'),
  mockMember('gm-15', 'Sam', 'mock-user-sam'),
]

export const MOCK_CATEGORIES: PointCategory[] = [
  { id: 'cat-1', group_id: MOCK_GROUP_ID, name: 'Carried the Chat', default_points: 5, type: 'positive', emoji: '🔥' },
  { id: 'cat-2', group_id: MOCK_GROUP_ID, name: 'Actually Made Plans', default_points: 7, type: 'positive', emoji: '📅' },
  { id: 'cat-3', group_id: MOCK_GROUP_ID, name: 'Funny Message', default_points: 3, type: 'positive', emoji: '😂' },
  { id: 'cat-4', group_id: MOCK_GROUP_ID, name: 'Helped Someone', default_points: 5, type: 'positive', emoji: '🤝' },
  { id: 'cat-5', group_id: MOCK_GROUP_ID, name: 'Clutch Behavior', default_points: 8, type: 'positive', emoji: '💪' },
  { id: 'cat-6', group_id: MOCK_GROUP_ID, name: 'Dry Response', default_points: -2, type: 'negative', emoji: '🥱' },
  { id: 'cat-7', group_id: MOCK_GROUP_ID, name: 'Flaked', default_points: -7, type: 'negative', emoji: '🪶' },
  { id: 'cat-8', group_id: MOCK_GROUP_ID, name: 'Bad Take', default_points: -4, type: 'negative', emoji: '🗑' },
  { id: 'cat-9', group_id: MOCK_GROUP_ID, name: 'Ghosted the Chat', default_points: -5, type: 'negative', emoji: '👻' },
  { id: 'cat-10', group_id: MOCK_GROUP_ID, name: 'Unholy Behavior', default_points: -10, type: 'negative', emoji: '😈' },
]

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString()

const mockEvent = (id: string, member_id: string, amount: number, categoryIndex: number, hours: number, reason?: string): PointEvent => ({
  id, group_id: MOCK_GROUP_ID, member_id, giver_id: MOCK_USER_ID, amount,
  category_id: MOCK_CATEGORIES[categoryIndex]?.id ?? null,
  reason: reason ?? MOCK_CATEGORIES[categoryIndex]?.name ?? 'Points awarded',
  created_at: hoursAgo(hours), member: MOCK_MEMBERS.find(member => member.id === member_id),
  giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[categoryIndex],
})

export const MOCK_POINT_EVENTS: PointEvent[] = [
  mockEvent('pe-1', 'gm-2', 16, 0, 1), mockEvent('pe-2', 'gm-3', 7, 4, 3),
  mockEvent('pe-3', 'gm-4', 14, 3, 5), mockEvent('pe-4', 'gm-5', 9, 2, 8),
  mockEvent('pe-5', 'gm-1', 10, 1, 12), mockEvent('pe-6', 'gm-6', 13, 0, 24),
  mockEvent('pe-7', 'gm-7', 12, 3, 36), mockEvent('pe-8', 'gm-8', 6, 4, 48),
  mockEvent('pe-9', 'gm-9', 17, 0, 60), mockEvent('pe-10', 'gm-10', 8, 2, 72),
  mockEvent('pe-11', 'gm-11', 15, 1, 76), mockEvent('pe-12', 'gm-13', 11, 3, 80),
  mockEvent('pe-13', 'gm-14', 5, 2, 90), mockEvent('pe-14', 'gm-15', 13, 4, 100),
]

export const MOCK_REWARDS: Reward[] = [
  { id: 'rw-1', group_id: MOCK_GROUP_ID, title: 'Pick the Movie', description: 'You get to pick what we watch next movie night. No complaints allowed.', cost: 20, active: true, created_at: hoursAgo(100) },
  { id: 'rw-2', group_id: MOCK_GROUP_ID, title: 'Roast Pass', description: 'Immunity from one group roast session. Use wisely.', cost: 15, active: true, created_at: hoursAgo(200) },
  { id: 'rw-3', group_id: MOCK_GROUP_ID, title: 'Custom Nickname', description: 'Choose your own nickname in the group for a week.', cost: 10, active: true, created_at: hoursAgo(300) },
  { id: 'rw-4', group_id: MOCK_GROUP_ID, title: 'Skip a Challenge', description: 'Opt out of any one challenge without penalty.', cost: 25, active: true, created_at: hoursAgo(400) },
]

export const MOCK_REDEMPTIONS: RewardRedemption[] = [
  { id: 'red-1', reward_id: 'rw-3', user_id: 'mock-user-kaison', group_id: MOCK_GROUP_ID, status: 'approved', created_at: hoursAgo(50), reward: MOCK_REWARDS[2], profile: MOCK_PROFILES[1] },
  { id: 'red-2', reward_id: 'rw-1', user_id: 'mock-user-jordan', group_id: MOCK_GROUP_ID, status: 'pending', created_at: hoursAgo(10), reward: MOCK_REWARDS[0], profile: MOCK_PROFILES[3] },
]

export const MOCK_CHALLENGES: Challenge[] = [
  { id: 'ch-1', group_id: MOCK_GROUP_ID, title: 'Send a voice memo', description: 'Break the text-only streak. Send a voice message to the group.', points: 10, due_date: new Date(now.getTime() + 3 * 86400000).toISOString(), active: true, created_by: MOCK_USER_ID, created_at: hoursAgo(48) },
  { id: 'ch-2', group_id: MOCK_GROUP_ID, title: 'Plan an actual hangout', description: 'Propose a real hangout with a date, time, and place. No vague "we should" energy.', points: 15, due_date: new Date(now.getTime() + 7 * 86400000).toISOString(), active: true, created_by: MOCK_USER_ID, created_at: hoursAgo(72) },
  { id: 'ch-3', group_id: MOCK_GROUP_ID, title: 'Funniest screenshot', description: 'Post the funniest screenshot from the group chat archives.', points: 8, due_date: new Date(now.getTime() + 5 * 86400000).toISOString(), active: true, created_by: MOCK_USER_ID, created_at: hoursAgo(24) },
  { id: 'ch-4', group_id: MOCK_GROUP_ID, title: 'Ghostbuster', description: 'Reply to a message that has been left on read for 24+ hours.', points: 5, due_date: null, active: false, created_by: MOCK_USER_ID, created_at: hoursAgo(200) },
]

export const MOCK_SUBMISSIONS: ChallengeSubmission[] = [
  { id: 'sub-1', challenge_id: 'ch-1', user_id: 'mock-user-kaison', group_id: MOCK_GROUP_ID, status: 'pending', proof_text: 'Sent it! Check the chat 🎙️', created_at: hoursAgo(5), challenge: MOCK_CHALLENGES[0], profile: MOCK_PROFILES[1] },
  { id: 'sub-2', challenge_id: 'ch-4', user_id: 'mock-user-alex', group_id: MOCK_GROUP_ID, status: 'approved', proof_text: 'I replied to that 3-day-old message 💀', created_at: hoursAgo(100), challenge: MOCK_CHALLENGES[3], profile: MOCK_PROFILES[2] },
]

// Totals per user based on MOCK_POINT_EVENTS
export const MOCK_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = MOCK_MEMBERS.map(member => ({
  member_id: member.id, user_id: member.user_id, display_name: member.display_name,
  total_points: MOCK_POINT_EVENTS.filter(event => event.member_id === member.id).reduce((sum, event) => sum + event.amount, 0), rank: 0,
})).sort((a, b) => b.total_points - a.total_points).map((entry, index) => ({ ...entry, rank: index + 1 }))

export const MOCK_LEADERBOARD_WEEKLY: LeaderboardEntry[] = MOCK_LEADERBOARD_ALL_TIME

export function getMockMemberPoints(memberId: string): number {
  return MOCK_POINT_EVENTS
    .filter(e => e.member_id === memberId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getMockMemberRank(memberId: string): number {
  const entry = MOCK_LEADERBOARD_ALL_TIME.find(e => e.member_id === memberId)
  return entry?.rank ?? 0
}

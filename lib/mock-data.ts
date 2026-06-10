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
  { id: MOCK_USER_ID, email: 'you@hcwk.app', display_name: 'You (Admin)', created_at: '2024-01-01T00:00:00Z' },
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

export const MOCK_MEMBERS: GroupMember[] = [
  { id: 'gm-1', group_id: MOCK_GROUP_ID, user_id: MOCK_USER_ID, role: 'admin', joined_at: '2024-01-01T00:00:00Z', profile: MOCK_PROFILES[0] },
  { id: 'gm-2', group_id: MOCK_GROUP_ID, user_id: 'mock-user-kaison', role: 'member', joined_at: '2024-01-01T00:00:00Z', profile: MOCK_PROFILES[1] },
  { id: 'gm-3', group_id: MOCK_GROUP_ID, user_id: 'mock-user-alex', role: 'member', joined_at: '2024-01-02T00:00:00Z', profile: MOCK_PROFILES[2] },
  { id: 'gm-4', group_id: MOCK_GROUP_ID, user_id: 'mock-user-jordan', role: 'member', joined_at: '2024-01-03T00:00:00Z', profile: MOCK_PROFILES[3] },
  { id: 'gm-5', group_id: MOCK_GROUP_ID, user_id: 'mock-user-maya', role: 'member', joined_at: '2024-01-04T00:00:00Z', profile: MOCK_PROFILES[4] },
  { id: 'gm-6', group_id: MOCK_GROUP_ID, user_id: 'mock-user-sam', role: 'member', joined_at: '2024-01-05T00:00:00Z', profile: MOCK_PROFILES[5] },
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

export const MOCK_POINT_EVENTS: PointEvent[] = [
  { id: 'pe-1', group_id: MOCK_GROUP_ID, user_id: 'mock-user-kaison', giver_id: MOCK_USER_ID, amount: 5, category_id: 'cat-1', reason: 'Carried the Chat', created_at: hoursAgo(1), profile: MOCK_PROFILES[1], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[0] },
  { id: 'pe-2', group_id: MOCK_GROUP_ID, user_id: 'mock-user-alex', giver_id: MOCK_USER_ID, amount: -7, category_id: 'cat-7', reason: 'Flaked on movie night', created_at: hoursAgo(3), profile: MOCK_PROFILES[2], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[6] },
  { id: 'pe-3', group_id: MOCK_GROUP_ID, user_id: 'mock-user-jordan', giver_id: MOCK_USER_ID, amount: 8, category_id: 'cat-5', reason: 'Clutch Behavior', created_at: hoursAgo(5), profile: MOCK_PROFILES[3], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[4] },
  { id: 'pe-4', group_id: MOCK_GROUP_ID, user_id: 'mock-user-maya', giver_id: MOCK_USER_ID, amount: 3, category_id: 'cat-3', reason: 'Funny Message', created_at: hoursAgo(8), profile: MOCK_PROFILES[4], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[2] },
  { id: 'pe-5', group_id: MOCK_GROUP_ID, user_id: MOCK_USER_ID, giver_id: MOCK_USER_ID, amount: 7, category_id: 'cat-2', reason: 'Actually Made Plans', created_at: hoursAgo(12), profile: MOCK_PROFILES[0], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[1] },
  { id: 'pe-6', group_id: MOCK_GROUP_ID, user_id: 'mock-user-sam', giver_id: MOCK_USER_ID, amount: -10, category_id: 'cat-10', reason: 'Unholy Behavior', created_at: hoursAgo(24), profile: MOCK_PROFILES[5], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[9] },
  { id: 'pe-7', group_id: MOCK_GROUP_ID, user_id: 'mock-user-kaison', giver_id: MOCK_USER_ID, amount: 5, category_id: 'cat-4', reason: 'Helped Someone', created_at: hoursAgo(36), profile: MOCK_PROFILES[1], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[3] },
  { id: 'pe-8', group_id: MOCK_GROUP_ID, user_id: 'mock-user-alex', giver_id: MOCK_USER_ID, amount: -2, category_id: 'cat-6', reason: 'Dry Response', created_at: hoursAgo(48), profile: MOCK_PROFILES[2], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[5] },
  { id: 'pe-9', group_id: MOCK_GROUP_ID, user_id: 'mock-user-jordan', giver_id: MOCK_USER_ID, amount: 5, category_id: 'cat-1', reason: 'Carried the Chat', created_at: hoursAgo(60), profile: MOCK_PROFILES[3], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[0] },
  { id: 'pe-10', group_id: MOCK_GROUP_ID, user_id: 'mock-user-maya', giver_id: MOCK_USER_ID, amount: -4, category_id: 'cat-8', reason: 'Bad Take', created_at: hoursAgo(72), profile: MOCK_PROFILES[4], giver_profile: MOCK_PROFILES[0], category: MOCK_CATEGORIES[7] },
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
export const MOCK_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
  { user_id: 'mock-user-kaison', display_name: 'Kaison', total_points: 10, rank: 1 },
  { user_id: 'mock-user-jordan', display_name: 'Jordan', total_points: 13, rank: 1 },
  { user_id: MOCK_USER_ID, display_name: 'You (Admin)', total_points: 7, rank: 3 },
  { user_id: 'mock-user-maya', display_name: 'Maya', total_points: -1, rank: 4 },
  { user_id: 'mock-user-alex', display_name: 'Alex', total_points: -9, rank: 5 },
  { user_id: 'mock-user-sam', display_name: 'Sam', total_points: -10, rank: 6 },
].sort((a, b) => b.total_points - a.total_points).map((e, i) => ({ ...e, rank: i + 1 }))

export const MOCK_LEADERBOARD_WEEKLY: LeaderboardEntry[] = [
  { user_id: 'mock-user-jordan', display_name: 'Jordan', total_points: 13, rank: 1 },
  { user_id: 'mock-user-kaison', display_name: 'Kaison', total_points: 10, rank: 2 },
  { user_id: MOCK_USER_ID, display_name: 'You (Admin)', total_points: 7, rank: 3 },
  { user_id: 'mock-user-maya', display_name: 'Maya', total_points: 3, rank: 4 },
  { user_id: 'mock-user-alex', display_name: 'Alex', total_points: -9, rank: 5 },
  { user_id: 'mock-user-sam', display_name: 'Sam', total_points: -10, rank: 6 },
]

export function getMockUserPoints(userId: string): number {
  return MOCK_POINT_EVENTS
    .filter(e => e.user_id === userId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getMockUserRank(userId: string): number {
  const entry = MOCK_LEADERBOARD_ALL_TIME.find(e => e.user_id === userId)
  return entry?.rank ?? 0
}

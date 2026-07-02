export interface Profile {
  id: string
  email: string
  display_name: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string | null
  display_name: string
  role: 'admin' | 'member'
  status: 'active' | 'inactive' | 'absent'
  avatar_seed: string
  created_by: string | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface PointCategory {
  id: string
  group_id: string
  name: string
  default_points: number
  type: 'positive' | 'negative'
  emoji: string
}

export interface PointEvent {
  id: string
  group_id: string
  member_id: string
  giver_id: string
  amount: number
  category_id: string | null
  reason: string
  created_at: string
  member?: GroupMember
  giver_profile?: Profile
  category?: PointCategory
}

export interface Reward {
  id: string
  group_id: string
  title: string
  description: string
  cost: number
  active: boolean
  created_at: string
}

export interface RewardRedemption {
  id: string
  reward_id: string
  user_id: string
  group_id: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  reward?: Reward
  profile?: Profile
}

export interface Challenge {
  id: string
  group_id: string
  title: string
  description: string
  points: number
  due_date: string | null
  active: boolean
  created_by: string
  created_at: string
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  user_id: string
  group_id: string
  status: 'pending' | 'approved' | 'denied'
  proof_text: string
  created_at: string
  challenge?: Challenge
  profile?: Profile
}

export interface LeaderboardEntry {
  member_id: string
  user_id: string | null
  display_name: string
  total_points: number
  rank: number
}

export type AvatarMood = 'happy' | 'neutral' | 'guilty' | 'chaotic'

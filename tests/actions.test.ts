import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client so actions can be exercised without a DB
const mocks = vi.hoisted(() => {
  const rpc = vi.fn()
  const insert = vi.fn()
  const getUser = vi.fn()
  return { rpc, insert, getUser }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: () => ({ insert: mocks.insert }),
  }),
}))

import { createGroupAction, joinGroupAction } from '@/app/actions/groups'
import { submitChallengeAction, updateSubmissionStatusAction } from '@/app/actions/challenges'
import { redeemRewardAction, updateRedemptionStatusAction } from '@/app/actions/rewards'

const user = { id: 'user-1', email: 'a@b.c', user_metadata: {} }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getUser.mockResolvedValue({ data: { user } })
})

describe('createGroupAction', () => {
  it('rejects unauthenticated users', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const result = await createGroupAction('HCWK')
    expect(result.error).toBe('Not authenticated')
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('creates the group via the atomic RPC', async () => {
    const group = { id: 'g1', name: 'HCWK' }
    mocks.rpc.mockResolvedValue({ data: group, error: null })
    const result = await createGroupAction('HCWK')
    expect(mocks.rpc).toHaveBeenCalledWith('create_group_with_admin',
      expect.objectContaining({ p_name: 'HCWK', p_invite_code: expect.any(String) }))
    expect(result.group).toEqual(group)
    expect(result.error).toBeNull()
  })

  it('surfaces RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const result = await createGroupAction('HCWK')
    expect(result.error).toBe('boom')
    expect(result.group).toBeNull()
  })
})

describe('joinGroupAction', () => {
  it('joins via the invite-code RPC', async () => {
    const group = { id: 'g1' }
    mocks.rpc.mockResolvedValue({ data: group, error: null })
    const result = await joinGroupAction('ABC123')
    expect(mocks.rpc).toHaveBeenCalledWith('join_group_with_code', { p_invite_code: 'ABC123' })
    expect(result.group).toEqual(group)
  })

  it('surfaces invalid invite code errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'Invalid invite code' } })
    const result = await joinGroupAction('WRONG')
    expect(result.error).toBe('Invalid invite code')
  })

  it('rejects unauthenticated users', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const result = await joinGroupAction('ABC123')
    expect(result.error).toBe('Not authenticated')
  })
})

describe('submitChallengeAction', () => {
  it('maps unique violations to a friendly duplicate message', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } })
    const result = await submitChallengeAction('ch1', 'g1', 'proof')
    expect(result.error).toBe('You already submitted this challenge')
  })

  it('returns null error on success', async () => {
    mocks.insert.mockResolvedValue({ error: null })
    const result = await submitChallengeAction('ch1', 'g1', 'proof')
    expect(result.error).toBeNull()
  })
})

describe('updateSubmissionStatusAction', () => {
  it('approves through the idempotent review RPC', async () => {
    mocks.rpc.mockResolvedValue({ error: null })
    const result = await updateSubmissionStatusAction('sub1', 'approved')
    expect(mocks.rpc).toHaveBeenCalledWith('review_submission',
      { p_submission_id: 'sub1', p_approve: true })
    expect(result.error).toBeNull()
  })

  it('denies with p_approve false', async () => {
    mocks.rpc.mockResolvedValue({ error: null })
    await updateSubmissionStatusAction('sub1', 'denied')
    expect(mocks.rpc).toHaveBeenCalledWith('review_submission',
      { p_submission_id: 'sub1', p_approve: false })
  })

  it('surfaces admin-only errors from the RPC', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'Only group admins can review submissions' } })
    const result = await updateSubmissionStatusAction('sub1', 'approved')
    expect(result.error).toMatch(/admins/)
  })
})

describe('redeemRewardAction', () => {
  it('redeems via the balance-enforcing RPC', async () => {
    mocks.rpc.mockResolvedValue({ error: null })
    const result = await redeemRewardAction('rw1')
    expect(mocks.rpc).toHaveBeenCalledWith('redeem_reward', { p_reward_id: 'rw1' })
    expect(result.error).toBeNull()
  })

  it('surfaces insufficient balance errors', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'Not enough points for this reward' } })
    const result = await redeemRewardAction('rw1')
    expect(result.error).toBe('Not enough points for this reward')
  })

  it('rejects unauthenticated users', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const result = await redeemRewardAction('rw1')
    expect(result.error).toBe('Not authenticated')
    expect(mocks.rpc).not.toHaveBeenCalled()
  })
})

describe('updateRedemptionStatusAction', () => {
  it('requires authentication', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const result = await updateRedemptionStatusAction('rd1', 'approved')
    expect(result.error).toBe('Not authenticated')
  })

  it('reviews through the idempotent RPC', async () => {
    mocks.rpc.mockResolvedValue({ error: null })
    await updateRedemptionStatusAction('rd1', 'approved')
    expect(mocks.rpc).toHaveBeenCalledWith('review_redemption',
      { p_redemption_id: 'rd1', p_approve: true })
  })
})

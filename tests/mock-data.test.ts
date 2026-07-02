import { describe, expect, it } from 'vitest'
import { MOCK_MEMBERS, MOCK_POINT_EVENTS, MOCK_GROUP_ID, MOCK_USER_ID } from '@/lib/mock-data'

// Demo mode is the only environment without RLS, so these invariants guard it
// against drifting from the real schema's guarantees.
describe('mock data invariants', () => {
  it('has a mix of claimed and unclaimed roster members', () => {
    expect(MOCK_MEMBERS.some(m => m.user_id === null)).toBe(true)
    expect(MOCK_MEMBERS.some(m => m.user_id !== null)).toBe(true)
  })

  it('all members belong to the mock group', () => {
    for (const m of MOCK_MEMBERS) expect(m.group_id).toBe(MOCK_GROUP_ID)
  })

  it('the current demo user is a linked admin (demo mode assumes admin)', () => {
    const you = MOCK_MEMBERS.find(m => m.user_id === MOCK_USER_ID)
    expect(you?.role).toBe('admin')
  })

  it('admins always have a linked account (role controls are gated on user_id)', () => {
    for (const m of MOCK_MEMBERS.filter(m => m.role === 'admin')) {
      expect(m.user_id).not.toBeNull()
    }
  })

  it('every point event references an existing roster member', () => {
    const memberIds = new Set(MOCK_MEMBERS.map(m => m.id))
    for (const e of MOCK_POINT_EVENTS) {
      expect(memberIds.has(e.member_id)).toBe(true)
    }
  })

  it('members have valid roles and statuses', () => {
    for (const m of MOCK_MEMBERS) {
      expect(['admin', 'member']).toContain(m.role)
      expect(['active', 'inactive', 'absent']).toContain(m.status)
      expect(m.display_name.length).toBeGreaterThan(0)
      expect(m.avatar_seed.length).toBeGreaterThan(0)
    }
  })
})

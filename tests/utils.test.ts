import { describe, expect, it } from 'vitest'
import { formatPoints, formatRelativeTime, generateInviteCode, getWeekStart, hashString } from '@/lib/utils'

describe('getWeekStart', () => {
  it('returns a Monday at midnight', () => {
    const start = getWeekStart()
    expect(start.getDay()).toBe(1)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
  })

  it('is not in the future', () => {
    expect(getWeekStart().getTime()).toBeLessThanOrEqual(Date.now())
  })
})

describe('generateInviteCode', () => {
  it('is 6 chars from the unambiguous alphabet', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateInviteCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    }
  })
})

describe('formatRelativeTime', () => {
  it('formats recent times', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now')
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago')
    expect(formatRelativeTime(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago')
    expect(formatRelativeTime(new Date(Date.now() - 2 * 86400000).toISOString())).toBe('2d ago')
  })
})

describe('formatPoints', () => {
  it('signs positive amounts only', () => {
    expect(formatPoints(5)).toBe('+5')
    expect(formatPoints(-3)).toBe('-3')
    expect(formatPoints(0)).toBe('0')
  })
})

describe('hashString (avatar determinism)', () => {
  it('is deterministic: same seed, same avatar', () => {
    expect(hashString('kaison-123')).toBe(hashString('kaison-123'))
  })

  it('differs across seeds', () => {
    expect(hashString('kaison-123')).not.toBe(hashString('alex-456'))
  })

  it('is non-negative', () => {
    for (const seed of ['a', 'HCWK', 'a-very-long-avatar-seed-string']) {
      expect(hashString(seed)).toBeGreaterThanOrEqual(0)
    }
  })
})

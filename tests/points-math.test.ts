import { describe, expect, it } from 'vitest'
import { computeTotals, computeLeaderboard } from '@/lib/points-math'

const event = (member_id: string, amount: number) => ({ member_id, amount })
const member = (id: string, display_name: string, user_id: string | null = null) => ({ id, display_name, user_id })

describe('computeTotals', () => {
  it('returns an empty map for no events', () => {
    expect(computeTotals([])).toEqual({})
  })

  it('sums events per member', () => {
    const totals = computeTotals([event('a', 5), event('a', 3), event('b', 7)])
    expect(totals).toEqual({ a: 8, b: 7 })
  })

  it('handles negative amounts and net-negative totals', () => {
    const totals = computeTotals([event('a', 5), event('a', -7), event('a', -10)])
    expect(totals).toEqual({ a: -12 })
  })

  it('removing an event fully undoes it', () => {
    const events = [event('a', 5), event('a', 3)]
    const before = computeTotals(events)
    const after = computeTotals(events.filter((_, i) => i !== 1))
    expect(before.a - after.a).toBe(3)
  })
})

describe('computeLeaderboard', () => {
  it('includes members with no events at 0 points', () => {
    const board = computeLeaderboard([member('a', 'Alex'), member('b', 'Bo')], [event('a', 4)])
    expect(board).toHaveLength(2)
    expect(board.find(e => e.member_id === 'b')?.total_points).toBe(0)
  })

  it('ranks members by total points descending', () => {
    const board = computeLeaderboard(
      [member('a', 'Alex'), member('b', 'Bo'), member('c', 'Cy')],
      [event('a', 3), event('b', 10), event('c', -2)]
    )
    expect(board.map(e => e.member_id)).toEqual(['b', 'a', 'c'])
    expect(board.map(e => e.rank)).toEqual([1, 2, 3])
  })

  it('assigns sequential ranks on ties', () => {
    const board = computeLeaderboard([member('a', 'Alex'), member('b', 'Bo')], [event('a', 5), event('b', 5)])
    expect(board.map(e => e.rank).sort()).toEqual([1, 2])
  })

  it('carries user_id through for claimed members', () => {
    const board = computeLeaderboard([member('a', 'Alex', 'user-1')], [])
    expect(board[0].user_id).toBe('user-1')
  })
})

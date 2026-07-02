import type { GroupMember, LeaderboardEntry, PointEvent } from './types'

// Sum the point_events ledger per member. Totals are never stored — they are
// always derived from events, so removing an event is a complete undo.
export function computeTotals(events: Pick<PointEvent, 'member_id' | 'amount'>[]): Record<string, number> {
  return events.reduce<Record<string, number>>((totals, event) => {
    totals[event.member_id] = (totals[event.member_id] ?? 0) + event.amount
    return totals
  }, {})
}

export function computeLeaderboard(
  members: Pick<GroupMember, 'id' | 'display_name' | 'user_id'>[],
  events: Pick<PointEvent, 'member_id' | 'amount'>[]
): LeaderboardEntry[] {
  const totals = computeTotals(events)
  return members
    .map(member => ({
      member_id: member.id,
      user_id: member.user_id,
      display_name: member.display_name,
      total_points: totals[member.id] ?? 0,
      rank: 0,
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

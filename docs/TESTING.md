# Testing HCWK Dojo

Three layers:

1. **Unit tests** — `npm test` (Vitest). Pure logic: point totals/leaderboard math (`lib/points-math.ts`), utils, mock-data invariants.
2. **RLS checks** — paste `supabase/tests/rls-checks.sql` into the Supabase SQL Editor and run it. It seeds throwaway users inside a transaction, asserts every policy, prints `PASS` notices, and rolls back. Any failure aborts with a `FAIL:` exception.
3. **Manual checklist** — below. Run in demo mode (`npm run dev` with no Supabase env vars, or temporarily rename `.env.local`) and against Supabase where noted.

## Manual checklist

### Roster management (admin) — demo + Supabase

- [ ] `/groups/<id>/members` shows the roster grid with point bubbles (red when negative)
- [ ] Add Member with only a name → card appears, marked "Roster member" (no account)
- [ ] Empty roster (new group / cleared demo localStorage) shows the "No members yet" state with an add CTA
- [ ] Click a card → member modal opens with avatar, award form, edit fields, point history
- [ ] Award via category (amount auto-fills), custom amount, and a negative amount with a reason
- [ ] Quick **+1 / −1** buttons on a card award instantly without opening the modal
- [ ] Quick buttons are hidden while "Award Multiple" select mode is on, and on inactive/absent cards
- [ ] Award Multiple: select several cards → "Award selected (N)" → all get the points
- [ ] Undo an event in the member modal history → total recalculates; undo also works on the admin page Activity tab (Supabase)
- [ ] Edit display name and status (absent/inactive dims the card and shows a status pill)
- [ ] Promote a **linked** member to admin (👑 badge appears on the card); role button is absent for unclaimed members
- [ ] Demote the only admin → blocked with "A group must keep at least one admin" (Supabase)
- [ ] Remove a member (confirm dialog) → card and their events disappear
- [ ] Demo persistence: roster and points survive a page reload (localStorage)

### Permissions (Supabase, second non-admin account)

- [ ] Non-admin sees no quick buttons, no Add Member, no Award Multiple
- [ ] Non-admin clicking another member's card sees read-only info only
- [ ] Non-admin clicking their **own** card sees avatar shuffle + their point history (no undo)
- [ ] Admin nav link and `/admin` page are blocked for non-admins
- [ ] `supabase/tests/rls-checks.sql` passes (server-side enforcement, not just hidden UI)

### Claim / join flow

- [ ] Invalid invite code → friendly error
- [ ] Valid code with unclaimed members → step 2 shows claimable tiles (unclaimed + not inactive only)
- [ ] "That's me — claim it" links the account; dashboard shows the claimed member's points and rank
- [ ] Claimed card now shows "Claimed"; the claimer can shuffle their avatar but cannot edit name/role/status
- [ ] Same member cannot be claimed twice; a user already in the group cannot claim at all (Supabase)
- [ ] "I'm new — join as myself" creates a fresh member row
- [ ] Valid code with **nothing** claimable joins as new immediately (no step 2)
- [ ] Demo mode: claiming marks the localStorage roster member as claimed

### Regressions

- [ ] Dashboard, leaderboard (weekly + all-time), rewards, challenges, member profile page all render
- [ ] Member modal "View full profile →" opens `/members/<memberId>` with full history
- [ ] `npm run build` and `npm test` pass

## Supabase migrations (order)

Fresh database: `schema.sql` → `policies.sql` → optional `seed.sql`.

Existing database: `migrate-roster-members.sql` → `migrate-point-event-undo.sql` → `migrate-claim-flow.sql` (all idempotent).

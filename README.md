# HCWK Dojo

A private, free ClassDojo-style web app for a friend group (HCWK = Holy Chat Without Kaison).
Points, leaderboard, challenges, rewards, and silly monster avatars. Mobile-first Next.js PWA.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (auth + Postgres + RLS) · Vercel

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials (or leave empty for demo mode)
npm run dev                  # http://localhost:3000
```

With no Supabase credentials the app runs in **demo mode**: mock data everywhere, you act as admin, and a yellow banner shows at the top. No Supabase calls are made.

### Commands

```bash
npm run dev      # dev server
npm run build    # production build (also the type check)
npm run lint     # ESLint
npm test         # Vitest unit tests
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the Project URL + anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
2. In the SQL Editor, run in order:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/migrations/004_join_and_defaults.sql`
   4. `supabase/migrations/005_submissions_redemptions.sql`
3. Optionally run `supabase/seed.sql` (example rewards/roster; point categories are created automatically with each group).
4. Under **Authentication → Providers → Email**, consider disabling "Confirm email" for a private friend group.

**Databases created before the roster model** instead run `supabase/migrations/000`–`005` in order (they're written for the old schema; fresh installs skip 000–003 because schema.sql/policies.sql already include those changes).

### Security model

Sensitive flows run through `security definer` RPCs, not direct table writes:

- `create_group_with_admin` — group + admin membership + 10 default point categories, atomically
- `join_group_with_code` / `claim_roster_member` — invite-code validated joins; direct membership inserts are blocked by RLS
- `review_submission` — admin-only, idempotent, points come from the challenge row
- `redeem_reward` / `review_redemption` — server-side balance check; approval deducts cost via a negative point event, exactly once

### Verifying RLS

Run `supabase/tests/rls-checks.sql` in the SQL Editor. It runs in a transaction and ends with `ROLLBACK`, so it leaves no data. Every check prints `PASS` in the Messages panel or fails the script.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js — no config needed).
2. Set environment variables for **Production and Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In Supabase **Authentication → URL Configuration**:
   - **Site URL**: your production domain (e.g. `https://hcwk-dojo.vercel.app`)
   - **Redirect URLs**: add `https://<your-domain>/**` and `https://*-<team>.vercel.app/**` for preview deploys.
4. Deploy. Do not commit `.env.local` or any keys (only the anon key is used client-side; it is safe to expose but still belongs in env vars).

## Manual QA checklist

- Sign up, create a group → 10 default point categories exist; you are admin.
- Join from a second account with the invite code → lands on dashboard; a bad code is rejected.
- Claim flow: admin adds a roster member → joiner sees and claims it.
- Award/undo points; leaderboard updates.
- Challenge: submit → second submit is blocked; admin approve → points granted once even if approve is clicked twice.
- Reward: redeem beyond balance is rejected; approve deducts the cost; a second pending request for the same reward is blocked.
- Admin can edit/deactivate/delete rewards and challenges.
- Settings → edit display name.
- Non-admin cannot open the Admin panel.

More detail in `docs/TESTING.md`.

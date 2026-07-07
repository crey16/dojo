# HCWK Dojo — Claude Code Context

## Project Overview

**HCWK Dojo** is a private, free ClassDojo-style web app for a friend group.
HCWK = Holy Chat Without Kaison.

Mobile-first Next.js PWA. Points, leaderboard, challenges, rewards, silly monster avatars.
No messaging. No payments. No AI. No native code.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Supabase (auth + database + RLS)
- Vercel (deployment)

## Project Structure

```
app/                          Next.js App Router pages
components/                   Reusable UI components
  ui/                         Primitives (Button, Input, Select, etc.)
lib/
  types.ts                    All TypeScript types
  utils.ts                    Helper functions
  mock-data.ts                Demo mode data
  supabase/                   Supabase client/server/middleware/config
  data/                       Data access layer (branches mock vs Supabase)
supabase/
  schema.sql                  Fresh install: run first in Supabase SQL Editor
  policies.sql                Fresh install: run second (RLS policies)
  migrations/                 Numbered migrations (000-005). Fresh installs run
                              004 + 005 after policies.sql; pre-roster databases
                              run 000-005 in order.
  seed.sql                    Optional example data (categories auto-seed now)
  tests/rls-checks.sql        Manual RLS assertion script (runs in a rollback)
```

## Demo Mode

The app runs fully in demo mode when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing from `.env.local`.

In demo mode:
- Mock data is shown everywhere
- Current user is treated as admin
- A yellow banner appears at the top
- No Supabase calls are made

## Development Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build (run to verify types + lint)
npm run lint       # ESLint
```

## Supabase Setup (Manual)

1. Create project at supabase.com
2. Copy Project URL and anon key to `.env.local`
3. Run `supabase/schema.sql` in SQL Editor
4. Run `supabase/policies.sql` in SQL Editor
5. Run `supabase/migrations/004_join_and_defaults.sql` then `005_submissions_redemptions.sql`
6. Optionally run `supabase/seed.sql` (rewards/roster examples; categories are auto-created)

Existing databases created before the roster model instead run `supabase/migrations/000`–`005` in order. Group creation, joining, challenge review, and reward redemption all go through security-definer RPCs — direct membership inserts are blocked by RLS.

## Key Design Rules

- Playful, colorful, childish ClassDojo-inspired UI
- Do NOT copy ClassDojo characters or copyrighted assets
- Mobile-first with bottom nav; desktop has sidebar
- Admin-only UI is hidden from regular members
- MonsterAvatar is deterministic: same name → same avatar
- Data layer branches on `isSupabaseConfigured()` — pages never call Supabase directly

## Point Categories (default)

Positive: Carried the Chat (+5), Actually Made Plans (+7), Funny Message (+3), Helped Someone (+5), Clutch Behavior (+8)

Negative: Dry Response (-2), Flaked (-7), Bad Take (-4), Ghosted the Chat (-5), Unholy Behavior (-10)

## Routes

- `/` — Landing / redirect
- `/login`, `/signup` — Auth
- `/settings` — User settings + sign out
- `/groups/create`, `/groups/join` — Group management
- `/groups/[groupId]/dashboard` — Home screen
- `/groups/[groupId]/leaderboard` — Weekly + all-time leaderboard
- `/groups/[groupId]/challenges` — Active/past challenges + submit
- `/groups/[groupId]/rewards` — Redeem rewards + history
- `/groups/[groupId]/members` — Member list
- `/groups/[groupId]/members/[memberId]` — Member profile
- `/groups/[groupId]/admin` — Admin panel (points, rewards, challenges, members, activity)

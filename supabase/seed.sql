-- HCWK Dojo Seed Data
-- Run AFTER schema.sql and policies.sql
-- NOTE: This creates example data. Replace UUIDs with your actual user IDs.

-- Default point categories are created automatically when a group is made
-- via the app (create_group_with_admin RPC in migrations/004) — no seed needed.

-- Example rewards:
-- INSERT INTO public.rewards (group_id, title, description, cost, active) VALUES
--   ('YOUR-GROUP-UUID', 'Pick the Movie', 'You get to pick what we watch next movie night. No complaints allowed.', 20, true),
--   ('YOUR-GROUP-UUID', 'Roast Pass', 'Immunity from one group roast session. Use wisely.', 15, true),
--   ('YOUR-GROUP-UUID', 'Custom Nickname', 'Choose your own nickname in the group for a week.', 10, true),
--   ('YOUR-GROUP-UUID', 'Skip a Challenge', 'Opt out of any one challenge without penalty.', 25, true);

-- Example unclaimed roster members (replace both UUIDs):
-- INSERT INTO public.group_members (group_id, display_name, role, status, created_by) VALUES
--   ('YOUR-GROUP-UUID', 'Kaison', 'member', 'active', 'YOUR-ADMIN-USER-UUID'),
--   ('YOUR-GROUP-UUID', 'Alex', 'member', 'active', 'YOUR-ADMIN-USER-UUID'),
--   ('YOUR-GROUP-UUID', 'Jayden', 'member', 'active', 'YOUR-ADMIN-USER-UUID'),
--   ('YOUR-GROUP-UUID', 'Tyler', 'member', 'absent', 'YOUR-ADMIN-USER-UUID');

-- How to set up your first group:
-- 1. Create your account via the signup page
-- 2. Go to /groups/create and create "HCWK"
-- 3. Copy the invite code shown in the admin panel
-- 4. Share it with your friends so they can join at /groups/join
-- 5. After all members join, run the INSERT statements above with the correct group ID
-- 6. Promote other admins via the admin panel → Members tab

SELECT 'Seed file ready — uncomment and fill in your UUIDs' as status;

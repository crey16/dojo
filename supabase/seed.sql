-- HCWK Dojo Seed Data
-- Run AFTER schema.sql and policies.sql
-- NOTE: This creates example data. Replace UUIDs with your actual user IDs.

-- Example: insert default categories into a group
-- Replace 'YOUR-GROUP-UUID' with your actual group ID after creating it

-- INSERT INTO public.point_categories (group_id, name, default_points, type, emoji) VALUES
--   ('YOUR-GROUP-UUID', 'Carried the Chat', 5, 'positive', '🔥'),
--   ('YOUR-GROUP-UUID', 'Actually Made Plans', 7, 'positive', '📅'),
--   ('YOUR-GROUP-UUID', 'Funny Message', 3, 'positive', '😂'),
--   ('YOUR-GROUP-UUID', 'Helped Someone', 5, 'positive', '🤝'),
--   ('YOUR-GROUP-UUID', 'Clutch Behavior', 8, 'positive', '💪'),
--   ('YOUR-GROUP-UUID', 'Dry Response', -2, 'negative', '🥱'),
--   ('YOUR-GROUP-UUID', 'Flaked', -7, 'negative', '🪶'),
--   ('YOUR-GROUP-UUID', 'Bad Take', -4, 'negative', '🗑'),
--   ('YOUR-GROUP-UUID', 'Ghosted the Chat', -5, 'negative', '👻'),
--   ('YOUR-GROUP-UUID', 'Unholy Behavior', -10, 'negative', '😈');

-- Example rewards:
-- INSERT INTO public.rewards (group_id, title, description, cost, active) VALUES
--   ('YOUR-GROUP-UUID', 'Pick the Movie', 'You get to pick what we watch next movie night. No complaints allowed.', 20, true),
--   ('YOUR-GROUP-UUID', 'Roast Pass', 'Immunity from one group roast session. Use wisely.', 15, true),
--   ('YOUR-GROUP-UUID', 'Custom Nickname', 'Choose your own nickname in the group for a week.', 10, true),
--   ('YOUR-GROUP-UUID', 'Skip a Challenge', 'Opt out of any one challenge without penalty.', 25, true);

-- How to set up your first group:
-- 1. Create your account via the signup page
-- 2. Go to /groups/create and create "HCWK"
-- 3. Copy the invite code shown in the admin panel
-- 4. Share it with your friends so they can join at /groups/join
-- 5. After all members join, run the INSERT statements above with the correct group ID
-- 6. Promote other admins via the admin panel → Members tab

SELECT 'Seed file ready — uncomment and fill in your UUIDs' as status;

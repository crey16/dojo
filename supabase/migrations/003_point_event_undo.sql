-- Migration: allow admins to undo (delete) point events.
-- Run this in the Supabase SQL Editor on databases that already ran
-- migrate-roster-members.sql. Safe to run more than once.

drop policy if exists "Admins can delete point events" on public.point_events;
create policy "Admins can delete point events" on public.point_events for delete
  using (public.is_group_admin(group_id, auth.uid()));

notify pgrst, 'reload schema';

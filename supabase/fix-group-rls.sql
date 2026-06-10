-- Fix: group create/join blocked by RLS
-- Run in Supabase SQL Editor on projects that already ran policies.sql.
-- (Fresh setups get this from the updated policies.sql.)

-- 1. Creating a group failed with "new row violates row-level security policy"
--    because insert ... returning reads the new row back, and the creator
--    isn't a group member yet when the select policy runs.
create policy "Creators can view their groups" on public.groups for select
  using (created_by = auth.uid());

-- 2. Joining by invite code never found the group, because non-members
--    can't select from groups. Look it up via a security definer function.
create or replace function public.get_group_by_invite_code(p_invite_code text)
returns setof public.groups as $$
  select * from public.groups where invite_code = upper(p_invite_code);
$$ language sql security definer stable;

-- Execute is granted via PUBLIC by default; revoking from anon alone does nothing
revoke execute on function public.get_group_by_invite_code(text) from public, anon;
grant execute on function public.get_group_by_invite_code(text) to authenticated;

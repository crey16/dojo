-- Migration: claim/link flow — let a signed-in user claim an unclaimed roster
-- member by invite code. Run this in the Supabase SQL Editor on databases that
-- already ran migrate-roster-members.sql. Safe to run more than once.

-- List unclaimed roster members for a group by invite code (the joiner is not
-- yet a member, so the group_members select policy would hide them)
create or replace function public.get_claimable_members(p_invite_code text)
returns table (id uuid, display_name text, avatar_seed text) as $$
  select gm.id, gm.display_name, gm.avatar_seed
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  where g.invite_code = upper(p_invite_code)
    and gm.user_id is null
    and gm.status <> 'inactive'
  order by gm.created_at;
$$ language sql security definer stable;

revoke execute on function public.get_claimable_members(text) from public, anon;
grant execute on function public.get_claimable_members(text) to authenticated;

-- Atomically link the calling user to an unclaimed roster member. Claiming
-- only happens through this function; there is no UPDATE policy that lets a
-- non-member touch group_members.
create or replace function public.claim_roster_member(p_invite_code text, p_member_id uuid)
returns public.group_members as $$
declare
  v_group public.groups;
  v_member public.group_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_group from public.groups where invite_code = upper(p_invite_code);
  if v_group.id is null then
    raise exception 'Invalid invite code';
  end if;

  if exists (
    select 1 from public.group_members
    where group_id = v_group.id and user_id = auth.uid()
  ) then
    raise exception 'You are already a member of this group';
  end if;

  update public.group_members
    set user_id = auth.uid(), updated_at = now()
    where id = p_member_id and group_id = v_group.id and user_id is null
    returning * into v_member;

  if v_member.id is null then
    raise exception 'That roster member has already been claimed';
  end if;

  return v_member;
end;
$$ language plpgsql security definer;

revoke execute on function public.claim_roster_member(text, uuid) from public, anon;
grant execute on function public.claim_roster_member(text, uuid) to authenticated;

notify pgrst, 'reload schema';

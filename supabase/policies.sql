-- HCWK Dojo Row Level Security Policies
-- Run AFTER schema.sql.
-- Fresh installs must ALSO run supabase/migrations/004_join_and_defaults.sql
-- and 005_submissions_redemptions.sql (RPCs + unique indexes the app relies on).
-- Migrations 000-003 are only for databases created before the roster model.

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.point_categories enable row level security;
alter table public.point_events enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;

-- Helper: is user a member of a group?
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$ language sql security definer stable;

-- Helper: is user an admin of a group?
create or replace function public.is_group_admin(p_group_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function public.is_roster_member_in_group(p_group_id uuid, p_member_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members where group_id = p_group_id and id = p_member_id
  );
$$ language sql security definer stable;

-- Linked members may only change avatar_seed themselves.
create or replace function public.is_limited_self_member_update(
  p_member_id uuid, p_group_id uuid, p_user_id uuid, p_display_name text, p_role text, p_status text
)
returns boolean as $$
  select exists (
    select 1 from public.group_members
    where id = p_member_id and group_id = p_group_id and user_id = p_user_id
      and display_name = p_display_name and role = p_role and status = p_status
  );
$$ language sql security definer stable;

-- Profiles
create policy "Users can view any profile" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Groups
create policy "Members can view their groups" on public.groups for select
  using (public.is_group_member(id, auth.uid()));
-- Needed so insert ... returning works before the creator's membership row exists
create policy "Creators can view their groups" on public.groups for select
  using (created_by = auth.uid());
create policy "Authenticated users can create groups" on public.groups for insert
  with check (auth.uid() is not null);
create policy "Admins can update group" on public.groups for update
  using (public.is_group_admin(id, auth.uid()));

-- Look up a group by invite code without being a member yet (RLS would hide it)
create or replace function public.get_group_by_invite_code(p_invite_code text)
returns setof public.groups as $$
  select * from public.groups where invite_code = upper(p_invite_code);
$$ language sql security definer stable;

-- Execute is granted via PUBLIC by default; revoking from anon alone does nothing
revoke execute on function public.get_group_by_invite_code(text) from public, anon;
grant execute on function public.get_group_by_invite_code(text) to authenticated;

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

-- Group members
create policy "Members can view group members" on public.group_members for select
  using (public.is_group_member(group_id, auth.uid()));
-- Joining a group happens only through the join_group_with_code /
-- claim_roster_member RPCs (see migrations/004_join_and_defaults.sql);
-- there is intentionally no self-insert policy.
create policy "Admins can create roster members" on public.group_members for insert
  with check (public.is_group_admin(group_id, auth.uid()));
create policy "Admins can update members" on public.group_members for update
  using (public.is_group_admin(group_id, auth.uid()))
  with check (public.is_group_admin(group_id, auth.uid()));
create policy "Linked members can update own roster profile" on public.group_members for update
  using (auth.uid() = user_id)
  with check (public.is_limited_self_member_update(id, group_id, auth.uid(), display_name, role, status));
create policy "Admins can manage members" on public.group_members for delete
  using (public.is_group_admin(group_id, auth.uid()));

-- Point categories
create policy "Members can view categories" on public.point_categories for select
  using (public.is_group_member(group_id, auth.uid()));
create policy "Admins can manage categories" on public.point_categories for all
  using (public.is_group_admin(group_id, auth.uid()));

-- Point events
create policy "Members can view point events" on public.point_events for select
  using (public.is_group_member(group_id, auth.uid()));
create policy "Admins can create point events" on public.point_events for insert
  with check (
    public.is_group_admin(group_id, auth.uid())
    and public.is_roster_member_in_group(group_id, member_id)
  );
create policy "Admins can delete point events" on public.point_events for delete
  using (public.is_group_admin(group_id, auth.uid()));

-- Rewards
create policy "Members can view rewards" on public.rewards for select
  using (public.is_group_member(group_id, auth.uid()));
create policy "Admins can manage rewards" on public.rewards for all
  using (public.is_group_admin(group_id, auth.uid()));

-- Reward redemptions
create policy "Members can view own redemptions" on public.reward_redemptions for select
  using (user_id = auth.uid() or public.is_group_admin(group_id, auth.uid()));
create policy "Members can redeem" on public.reward_redemptions for insert
  with check (user_id = auth.uid() and public.is_group_member(group_id, auth.uid()));
create policy "Admins can update redemptions" on public.reward_redemptions for update
  using (public.is_group_admin(group_id, auth.uid()));

-- Challenges
create policy "Members can view challenges" on public.challenges for select
  using (public.is_group_member(group_id, auth.uid()));
create policy "Admins can manage challenges" on public.challenges for all
  using (public.is_group_admin(group_id, auth.uid()));

-- Challenge submissions
create policy "Members can view own submissions" on public.challenge_submissions for select
  using (user_id = auth.uid() or public.is_group_admin(group_id, auth.uid()));
create policy "Members can submit challenges" on public.challenge_submissions for insert
  with check (user_id = auth.uid() and public.is_group_member(group_id, auth.uid()));
create policy "Admins can update submissions" on public.challenge_submissions for update
  using (public.is_group_admin(group_id, auth.uid()));

-- HCWK Dojo Row Level Security Policies
-- Run AFTER schema.sql

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

-- Group members
create policy "Members can view group members" on public.group_members for select
  using (public.is_group_member(group_id, auth.uid()));
create policy "Authenticated users can join groups" on public.group_members for insert
  with check (auth.uid() = user_id);
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

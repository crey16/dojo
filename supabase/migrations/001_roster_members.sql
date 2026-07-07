-- Existing-project migration: auth-user members -> roster members
-- Run once before the updated policies.sql.

alter table public.group_members add column if not exists display_name text;
alter table public.group_members add column if not exists status text default 'active';
alter table public.group_members add column if not exists avatar_seed text default uuid_generate_v4()::text;
alter table public.group_members add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.group_members add column if not exists created_at timestamptz default now();
alter table public.group_members add column if not exists updated_at timestamptz default now();

update public.group_members gm
set display_name = p.display_name,
    created_by = coalesce(gm.created_by, g.created_by),
    created_at = coalesce(gm.created_at, gm.joined_at, now()),
    updated_at = coalesce(gm.updated_at, now())
from public.profiles p, public.groups g
where gm.user_id = p.id and gm.group_id = g.id and gm.display_name is null;

alter table public.group_members alter column display_name set not null;
alter table public.group_members alter column status set not null;
alter table public.group_members alter column avatar_seed set not null;
alter table public.group_members alter column created_at set not null;
alter table public.group_members alter column updated_at set not null;
alter table public.group_members alter column user_id drop not null;
alter table public.group_members drop constraint if exists group_members_user_id_fkey;
alter table public.group_members add constraint group_members_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.group_members drop constraint if exists group_members_status_check;
alter table public.group_members add constraint group_members_status_check check (status in ('active', 'inactive', 'absent'));

alter table public.point_events add column if not exists member_id uuid references public.group_members(id) on delete cascade;

-- Preserve historical points for users who were previously removed from a group.
insert into public.group_members (group_id, user_id, display_name, role, status, created_by, created_at, updated_at)
select distinct pe.group_id, pe.user_id, p.display_name, 'member', 'inactive', g.created_by, now(), now()
from public.point_events pe
join public.profiles p on p.id = pe.user_id
join public.groups g on g.id = pe.group_id
where not exists (
  select 1 from public.group_members gm where gm.group_id = pe.group_id and gm.user_id = pe.user_id
);

update public.point_events pe
set member_id = gm.id
from public.group_members gm
where pe.member_id is null and pe.group_id = gm.group_id and pe.user_id = gm.user_id;

do $$
begin
  if exists (select 1 from public.point_events where member_id is null) then
    raise exception 'Some point events could not be mapped to roster members';
  end if;
end $$;

alter table public.point_events alter column member_id set not null;
alter table public.point_events drop column user_id;
alter table public.group_members drop column if exists joined_at;

create or replace function public.protect_last_group_admin()
returns trigger as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin') and
    (select count(*) from public.group_members where group_id = old.group_id and role = 'admin') <= 1 then
    raise exception 'A group must keep at least one admin';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_last_group_admin_trigger on public.group_members;
create trigger protect_last_group_admin_trigger
  before update of role or delete on public.group_members
  for each row execute procedure public.protect_last_group_admin();

create or replace function public.is_roster_member_in_group(p_group_id uuid, p_member_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members where group_id = p_group_id and id = p_member_id
  );
$$ language sql security definer stable;

drop policy if exists "Admins can create point events" on public.point_events;
create policy "Admins can create point events" on public.point_events for insert
  with check (
    public.is_group_admin(group_id, auth.uid())
    and public.is_roster_member_in_group(group_id, member_id)
  );

drop policy if exists "Authenticated users can join groups" on public.group_members;
drop policy if exists "Admins can create roster members" on public.group_members;
drop policy if exists "Admins can update members" on public.group_members;
drop policy if exists "Linked members can update own roster profile" on public.group_members;
drop policy if exists "Admins can manage members" on public.group_members;

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

-- Make the new columns immediately visible to Supabase's REST API.
notify pgrst, 'reload schema';

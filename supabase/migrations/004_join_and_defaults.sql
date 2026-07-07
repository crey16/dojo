-- 004: Lock down group joining + atomic group creation with default categories
-- Run after 003_point_event_undo.sql

-- Direct self-inserts into group_members allowed any authed user to join any
-- group whose id they knew. Joining now goes through security-definer RPCs
-- that validate the invite code.
drop policy if exists "Authenticated users can join groups" on public.group_members;
-- Legacy name from early ad-hoc setup queries; same open-join hole
drop policy if exists "Users can join groups as themselves" on public.group_members;

-- Join a group by invite code. Validates the code server-side and inserts the
-- membership row atomically.
create or replace function public.join_group_with_code(p_invite_code text)
returns public.groups as $$
declare
  v_group public.groups;
  v_display_name text;
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
    return v_group; -- already a member: no-op success
  end if;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.group_members (group_id, user_id, display_name, role, created_by)
  values (v_group.id, auth.uid(), coalesce(v_display_name, 'Member'), 'member', auth.uid());

  return v_group;
end;
$$ language plpgsql security definer;

revoke execute on function public.join_group_with_code(text) from public, anon;
grant execute on function public.join_group_with_code(text) to authenticated;

-- Create a group, its admin membership, and the default point categories in
-- one transaction so a group can never exist without an admin.
create or replace function public.create_group_with_admin(p_name text, p_invite_code text)
returns public.groups as $$
declare
  v_group public.groups;
  v_display_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Group name is required';
  end if;

  insert into public.groups (name, invite_code, created_by)
  values (trim(p_name), upper(p_invite_code), auth.uid())
  returning * into v_group;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.group_members (group_id, user_id, display_name, role, created_by)
  values (v_group.id, auth.uid(), coalesce(v_display_name, 'Admin'), 'admin', auth.uid());

  insert into public.point_categories (group_id, name, default_points, type, emoji) values
    (v_group.id, 'Carried the Chat',   5,   'positive', '🔥'),
    (v_group.id, 'Actually Made Plans', 7,  'positive', '📅'),
    (v_group.id, 'Funny Message',      3,   'positive', '😂'),
    (v_group.id, 'Helped Someone',     5,   'positive', '🤝'),
    (v_group.id, 'Clutch Behavior',    8,   'positive', '💪'),
    (v_group.id, 'Dry Response',       -2,  'negative', '🥱'),
    (v_group.id, 'Flaked',             -7,  'negative', '🪶'),
    (v_group.id, 'Bad Take',           -4,  'negative', '🗑'),
    (v_group.id, 'Ghosted the Chat',   -5,  'negative', '👻'),
    (v_group.id, 'Unholy Behavior',    -10, 'negative', '😈');

  return v_group;
end;
$$ language plpgsql security definer;

revoke execute on function public.create_group_with_admin(text, text) from public, anon;
grant execute on function public.create_group_with_admin(text, text) to authenticated;

notify pgrst, 'reload schema';

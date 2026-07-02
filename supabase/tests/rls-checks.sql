-- RLS assertion script — run manually in the Supabase SQL Editor.
-- Everything runs inside one transaction and ends with ROLLBACK, so it leaves
-- no data behind. Watch the Messages panel: every check prints PASS or fails
-- the whole script with a FAIL exception.
--
-- Requires: schema.sql + policies.sql (or the migrate-*.sql files) applied.

begin;

-- ── Seed (as postgres; the on_auth_user_created trigger creates profiles) ──
insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-00000000aaaa', 'rls-admin@test.local',  '{"display_name": "RLS Admin"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'rls-member@test.local', '{"display_name": "RLS Member"}'),
  ('00000000-0000-0000-0000-00000000cccc', 'rls-joiner@test.local', '{"display_name": "RLS Joiner"}');

insert into public.groups (id, name, invite_code, created_by)
values ('00000000-0000-0000-0000-000000000001', 'RLS Test Group', 'RLSTST', '00000000-0000-0000-0000-00000000aaaa');

insert into public.group_members (id, group_id, user_id, display_name, role, status, created_by)
values
  -- linked admin
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000aaaa', 'RLS Admin',  'admin',  'active', '00000000-0000-0000-0000-00000000aaaa'),
  -- linked regular member
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000bbbb', 'RLS Member', 'member', 'active', '00000000-0000-0000-0000-00000000aaaa'),
  -- unclaimed roster member
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', null, 'Unclaimed Kid', 'member', 'active', '00000000-0000-0000-0000-00000000aaaa');

-- Helper to impersonate a user for the rest of the transaction
create or replace function pg_temp.impersonate(p_uid text) returns void as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
$$ language sql;

-- ── 1. Admin can create a point event ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
insert into public.point_events (id, group_id, member_id, giver_id, amount, reason)
values ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-00000000aaaa', 5, 'rls test');
do $$ begin raise notice 'PASS: admin can insert point events'; end $$;

-- ── 2. Regular member can SELECT but not INSERT point events ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000bbbb');
do $$
declare v_count int;
begin
  select count(*) into v_count from public.point_events where group_id = '00000000-0000-0000-0000-000000000001';
  if v_count < 1 then raise exception 'FAIL: member cannot see point events'; end if;
  raise notice 'PASS: member can view point events';
end $$;

do $$
begin
  insert into public.point_events (group_id, member_id, giver_id, amount, reason)
  values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-00000000bbbb', 99, 'self award');
  raise exception 'FAIL: member was able to insert a point event';
exception when insufficient_privilege then
  raise notice 'PASS: member cannot insert point events';
end $$;

-- ── 3. Regular member cannot delete (undo) point events; admin can ──
do $$
declare v_count int;
begin
  delete from public.point_events where id = '00000000-0000-0000-0000-000000000021';
  get diagnostics v_count = row_count;
  if v_count > 0 then raise exception 'FAIL: member deleted a point event'; end if;
  raise notice 'PASS: member cannot delete point events';
end $$;

select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
do $$
declare v_count int;
begin
  delete from public.point_events where id = '00000000-0000-0000-0000-000000000021';
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'FAIL: admin could not delete a point event'; end if;
  raise notice 'PASS: admin can delete (undo) point events';
end $$;

-- ── 4. Member cannot update another member's row ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000bbbb');
do $$
declare v_count int;
begin
  update public.group_members set display_name = 'Hacked'
  where id = '00000000-0000-0000-0000-000000000013';
  get diagnostics v_count = row_count;
  if v_count > 0 then raise exception 'FAIL: member updated someone else''s row'; end if;
  raise notice 'PASS: member cannot update other members';
end $$;

-- ── 5. Linked member can change own avatar_seed but nothing else ──
do $$
begin
  update public.group_members set avatar_seed = 'new-seed-123'
  where id = '00000000-0000-0000-0000-000000000012';
  raise notice 'PASS: linked member can change own avatar_seed';
end $$;

do $$
begin
  update public.group_members set role = 'admin'
  where id = '00000000-0000-0000-0000-000000000012';
  raise exception 'FAIL: member promoted themselves to admin';
exception when insufficient_privilege then
  raise notice 'PASS: member cannot change own role';
end $$;

-- ── 6. Member cannot create roster members; admin can ──
do $$
begin
  insert into public.group_members (group_id, user_id, display_name, role, created_by)
  values ('00000000-0000-0000-0000-000000000001', null, 'Sneaky Add', 'member', '00000000-0000-0000-0000-00000000bbbb');
  raise exception 'FAIL: member created a roster member';
exception when insufficient_privilege then
  raise notice 'PASS: member cannot create roster members';
end $$;

select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
insert into public.group_members (group_id, user_id, display_name, role, created_by)
values ('00000000-0000-0000-0000-000000000001', null, 'Admin Added Kid', 'member', '00000000-0000-0000-0000-00000000aaaa');
do $$ begin raise notice 'PASS: admin can create unclaimed roster members'; end $$;

-- ── 7. claim_roster_member: joiner claims once, then all abuse paths fail ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000cccc');
select public.claim_roster_member('RLSTST', '00000000-0000-0000-0000-000000000013');
do $$
begin
  if not exists (
    select 1 from public.group_members
    where id = '00000000-0000-0000-0000-000000000013'
      and user_id = '00000000-0000-0000-0000-00000000cccc'
  ) then raise exception 'FAIL: claim did not link the roster member'; end if;
  raise notice 'PASS: joiner claimed an unclaimed roster member';
end $$;

do $$
begin
  perform public.claim_roster_member('RLSTST', '00000000-0000-0000-0000-000000000013');
  raise exception 'FAIL: claimed an already-claimed member';
exception when raise_exception then
  raise notice 'PASS: cannot claim twice / already a member (%)' , sqlerrm;
end $$;

do $$
begin
  perform public.claim_roster_member('WRONG1', '00000000-0000-0000-0000-000000000013');
  raise exception 'FAIL: claim accepted an invalid invite code';
exception when raise_exception then
  raise notice 'PASS: invalid invite code rejected (%)', sqlerrm;
end $$;

-- ── 8. Last-admin protection ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
do $$
begin
  update public.group_members set role = 'member'
  where id = '00000000-0000-0000-0000-000000000011';
  raise exception 'FAIL: demoted the last admin';
exception when raise_exception then
  raise notice 'PASS: last admin cannot be demoted (%)', sqlerrm;
end $$;

do $$ begin raise notice '=== ALL RLS CHECKS PASSED ==='; end $$;

rollback;

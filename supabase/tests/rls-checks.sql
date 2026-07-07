-- RLS assertion script — run manually in the Supabase SQL Editor.
-- Everything runs inside one transaction and ends with ROLLBACK, so it leaves
-- no data behind. Watch the Messages panel: every check prints PASS or fails
-- the whole script with a FAIL exception.
--
-- Requires: schema.sql + policies.sql + migrations/004 + migrations/005 applied
-- (or, for pre-roster databases, migrations/000-005 in order).

begin;

-- ── Seed (as postgres; the on_auth_user_created trigger creates profiles) ──
insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-00000000aaaa', 'rls-admin@test.local',  '{"display_name": "RLS Admin"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'rls-member@test.local', '{"display_name": "RLS Member"}'),
  ('00000000-0000-0000-0000-00000000cccc', 'rls-joiner@test.local', '{"display_name": "RLS Joiner"}'),
  ('00000000-0000-0000-0000-00000000dddd', 'rls-outsider@test.local', '{"display_name": "RLS Outsider"}');

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

-- ── 9. Direct self-insert into group_members is denied (join via RPC only) ──
select pg_temp.impersonate('00000000-0000-0000-0000-00000000dddd');
do $$
begin
  insert into public.group_members (group_id, user_id, display_name, role, created_by)
  values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000dddd', 'Gatecrasher', 'member', '00000000-0000-0000-0000-00000000dddd');
  raise exception 'FAIL: outsider self-inserted a membership';
exception when insufficient_privilege then
  raise notice 'PASS: direct membership self-insert is denied';
end $$;

-- ── 10. join_group_with_code: valid code joins, bad code fails, rejoin is no-op ──
do $$
begin
  perform public.join_group_with_code('WRONG1');
  raise exception 'FAIL: joined with an invalid invite code';
exception when raise_exception then
  raise notice 'PASS: join with invalid code rejected (%)', sqlerrm;
end $$;

select public.join_group_with_code('RLSTST');
do $$
begin
  if not exists (
    select 1 from public.group_members
    where group_id = '00000000-0000-0000-0000-000000000001'
      and user_id = '00000000-0000-0000-0000-00000000dddd' and role = 'member'
  ) then raise exception 'FAIL: join RPC did not create membership'; end if;
  raise notice 'PASS: join_group_with_code creates membership';
end $$;

select public.join_group_with_code('RLSTST'); -- second call: no-op success
do $$
declare v_count int;
begin
  select count(*) into v_count from public.group_members
  where group_id = '00000000-0000-0000-0000-000000000001'
    and user_id = '00000000-0000-0000-0000-00000000dddd';
  if v_count <> 1 then raise exception 'FAIL: rejoin duplicated membership'; end if;
  raise notice 'PASS: rejoining is an idempotent no-op';
end $$;

-- ── 11. create_group_with_admin: admin membership + default categories ──
do $$
declare v_group public.groups; v_cats int;
begin
  v_group := public.create_group_with_admin('RPC Group', 'RPCGRP');
  if not exists (
    select 1 from public.group_members
    where group_id = v_group.id and user_id = '00000000-0000-0000-0000-00000000dddd' and role = 'admin'
  ) then raise exception 'FAIL: creator is not admin of new group'; end if;
  select count(*) into v_cats from public.point_categories where group_id = v_group.id;
  if v_cats <> 10 then raise exception 'FAIL: expected 10 default categories, got %', v_cats; end if;
  raise notice 'PASS: create_group_with_admin seeds admin + 10 categories';
end $$;

-- ── 12. Challenge flow: duplicate submission blocked, approval idempotent ──
reset role; -- back to postgres for seeding
insert into public.challenges (id, group_id, title, points, active, created_by)
values ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'RLS Challenge', 15, true, '00000000-0000-0000-0000-00000000aaaa');

select pg_temp.impersonate('00000000-0000-0000-0000-00000000bbbb');
insert into public.challenge_submissions (id, challenge_id, user_id, group_id, proof_text)
values ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-000000000001', 'did it');

do $$
begin
  insert into public.challenge_submissions (challenge_id, user_id, group_id, proof_text)
  values ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-000000000001', 'again');
  raise exception 'FAIL: duplicate submission allowed';
exception when unique_violation then
  raise notice 'PASS: duplicate challenge submission blocked';
end $$;

do $$
begin
  perform public.review_submission('00000000-0000-0000-0000-000000000032', true);
  raise exception 'FAIL: non-admin reviewed a submission';
exception when raise_exception then
  raise notice 'PASS: non-admin cannot review submissions (%)', sqlerrm;
end $$;

select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
select public.review_submission('00000000-0000-0000-0000-000000000032', true);
select public.review_submission('00000000-0000-0000-0000-000000000032', true); -- second approve: no-op
do $$
declare v_events int; v_sum int;
begin
  select count(*), coalesce(sum(amount), 0) into v_events, v_sum
  from public.point_events
  where member_id = '00000000-0000-0000-0000-000000000012' and reason like 'Challenge approved%';
  if v_events <> 1 or v_sum <> 15 then
    raise exception 'FAIL: expected 1 approval event of 15 pts, got % events / % pts', v_events, v_sum;
  end if;
  raise notice 'PASS: challenge approval is idempotent and uses challenge points';
end $$;

-- ── 13. Reward flow: balance enforced, one pending, approval deducts once ──
reset role; -- back to postgres for seeding
insert into public.rewards (id, group_id, title, cost, active)
values ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', 'RLS Reward', 10, true);

select pg_temp.impersonate('00000000-0000-0000-0000-00000000bbbb');
-- member has 15 pts from the approved challenge; reward costs 10
select public.redeem_reward('00000000-0000-0000-0000-000000000041');
do $$
begin
  perform public.redeem_reward('00000000-0000-0000-0000-000000000041');
  raise exception 'FAIL: second pending redemption allowed';
exception when raise_exception then
  raise notice 'PASS: duplicate pending redemption blocked (%)', sqlerrm;
end $$;

select pg_temp.impersonate('00000000-0000-0000-0000-00000000aaaa');
do $$
declare v_red_id uuid; v_events int; v_balance int;
begin
  select id into v_red_id from public.reward_redemptions
  where reward_id = '00000000-0000-0000-0000-000000000041' and status = 'pending';
  perform public.review_redemption(v_red_id, true);
  perform public.review_redemption(v_red_id, true); -- second approve: no-op
  select count(*) into v_events from public.point_events
  where member_id = '00000000-0000-0000-0000-000000000012' and reason like 'Reward redeemed%';
  if v_events <> 1 then raise exception 'FAIL: expected 1 deduction event, got %', v_events; end if;
  v_balance := public.member_balance('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000bbbb');
  if v_balance <> 5 then raise exception 'FAIL: expected balance 5 after deduction, got %', v_balance; end if;
  raise notice 'PASS: redemption approval deducts cost exactly once';
end $$;

-- member now has 5 pts; a 10-pt redemption must be rejected
select pg_temp.impersonate('00000000-0000-0000-0000-00000000bbbb');
do $$
begin
  perform public.redeem_reward('00000000-0000-0000-0000-000000000041');
  raise exception 'FAIL: redemption allowed with insufficient balance';
exception when raise_exception then
  raise notice 'PASS: insufficient balance rejected (%)', sqlerrm;
end $$;

do $$ begin raise notice '=== ALL RLS CHECKS PASSED ==='; end $$;

rollback;

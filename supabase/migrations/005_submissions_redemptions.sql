-- 005: Duplicate protection + safe approval/redemption flows
-- Run after 004_join_and_defaults.sql

-- A user gets one live submission per challenge; a denied one may be retried.
create unique index if not exists challenge_submissions_one_live
  on public.challenge_submissions (challenge_id, user_id)
  where status <> 'denied';

-- One pending redemption per reward per user.
create unique index if not exists reward_redemptions_one_pending
  on public.reward_redemptions (reward_id, user_id)
  where status = 'pending';

-- Current point balance for the roster member linked to a user in a group.
create or replace function public.member_balance(p_group_id uuid, p_user_id uuid)
returns integer as $$
  select coalesce(sum(pe.amount), 0)::integer
  from public.point_events pe
  join public.group_members gm on gm.id = pe.member_id
  where pe.group_id = p_group_id and gm.user_id = p_user_id;
$$ language sql security definer stable;

-- Approve/deny a challenge submission. Idempotent: only a pending submission
-- transitions, and points come from the challenge row, never the client.
create or replace function public.review_submission(p_submission_id uuid, p_approve boolean)
returns void as $$
declare
  v_sub public.challenge_submissions;
  v_challenge public.challenges;
  v_member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_sub from public.challenge_submissions where id = p_submission_id;
  if v_sub.id is null then
    raise exception 'Submission not found';
  end if;

  if not public.is_group_admin(v_sub.group_id, auth.uid()) then
    raise exception 'Only group admins can review submissions';
  end if;

  if v_sub.status <> 'pending' then
    return; -- already reviewed: no-op
  end if;

  update public.challenge_submissions
    set status = case when p_approve then 'approved' else 'denied' end
    where id = p_submission_id and status = 'pending';

  if p_approve then
    select * into v_challenge from public.challenges where id = v_sub.challenge_id;

    select id into v_member_id from public.group_members
      where group_id = v_sub.group_id and user_id = v_sub.user_id;

    if v_member_id is not null then
      insert into public.point_events (group_id, member_id, giver_id, amount, category_id, reason)
      values (v_sub.group_id, v_member_id, auth.uid(), v_challenge.points, null,
              'Challenge approved: ' || v_challenge.title);
    end if;
  end if;
end;
$$ language plpgsql security definer;

revoke execute on function public.review_submission(uuid, boolean) from public, anon;
grant execute on function public.review_submission(uuid, boolean) to authenticated;

-- Request a redemption. Enforces active reward + sufficient balance server-side.
create or replace function public.redeem_reward(p_reward_id uuid)
returns public.reward_redemptions as $$
declare
  v_reward public.rewards;
  v_redemption public.reward_redemptions;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_reward from public.rewards where id = p_reward_id;
  if v_reward.id is null or not v_reward.active then
    raise exception 'Reward not available';
  end if;

  if not public.is_group_member(v_reward.group_id, auth.uid()) then
    raise exception 'You are not a member of this group';
  end if;

  if public.member_balance(v_reward.group_id, auth.uid()) < v_reward.cost then
    raise exception 'Not enough points for this reward';
  end if;

  insert into public.reward_redemptions (reward_id, user_id, group_id, status)
  values (p_reward_id, auth.uid(), v_reward.group_id, 'pending')
  returning * into v_redemption;

  return v_redemption;
exception
  when unique_violation then
    raise exception 'You already have a pending request for this reward';
end;
$$ language plpgsql security definer;

revoke execute on function public.redeem_reward(uuid) from public, anon;
grant execute on function public.redeem_reward(uuid) to authenticated;

-- Approve/deny a redemption. On approval the cost is deducted via a negative
-- point event. Idempotent: only a pending redemption transitions.
create or replace function public.review_redemption(p_redemption_id uuid, p_approve boolean)
returns void as $$
declare
  v_red public.reward_redemptions;
  v_reward public.rewards;
  v_member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_red from public.reward_redemptions where id = p_redemption_id;
  if v_red.id is null then
    raise exception 'Redemption not found';
  end if;

  if not public.is_group_admin(v_red.group_id, auth.uid()) then
    raise exception 'Only group admins can review redemptions';
  end if;

  if v_red.status <> 'pending' then
    return; -- already reviewed: no-op
  end if;

  if p_approve then
    select * into v_reward from public.rewards where id = v_red.reward_id;

    if public.member_balance(v_red.group_id, v_red.user_id) < v_reward.cost then
      raise exception 'Member no longer has enough points for this reward';
    end if;

    select id into v_member_id from public.group_members
      where group_id = v_red.group_id and user_id = v_red.user_id;

    if v_member_id is null then
      raise exception 'No roster member linked to this user';
    end if;

    update public.reward_redemptions set status = 'approved'
      where id = p_redemption_id and status = 'pending';

    insert into public.point_events (group_id, member_id, giver_id, amount, category_id, reason)
    values (v_red.group_id, v_member_id, auth.uid(), -v_reward.cost, null,
            'Reward redeemed: ' || v_reward.title);
  else
    update public.reward_redemptions set status = 'denied'
      where id = p_redemption_id and status = 'pending';
  end if;
end;
$$ language plpgsql security definer;

revoke execute on function public.review_redemption(uuid, boolean) from public, anon;
grant execute on function public.review_redemption(uuid, boolean) to authenticated;

notify pgrst, 'reload schema';

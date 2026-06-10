-- HCWK Dojo Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  created_at timestamptz default now() not null
);

-- Groups
create table if not exists public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text not null unique,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null
);

-- Group members
create table if not exists public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- Point categories
create table if not exists public.point_categories (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  name text not null,
  default_points integer not null,
  type text not null check (type in ('positive', 'negative')),
  emoji text not null default '⭐',
  created_at timestamptz default now() not null
);

-- Point events (history of all point changes)
create table if not exists public.point_events (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  giver_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  category_id uuid references public.point_categories(id) on delete set null,
  reason text not null default '',
  created_at timestamptz default now() not null
);

-- Rewards
create table if not exists public.rewards (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  cost integer not null,
  active boolean not null default true,
  created_at timestamptz default now() not null
);

-- Reward redemptions
create table if not exists public.reward_redemptions (
  id uuid default uuid_generate_v4() primary key,
  reward_id uuid references public.rewards(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz default now() not null
);

-- Challenges
create table if not exists public.challenges (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  points integer not null,
  due_date timestamptz,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Challenge submissions
create table if not exists public.challenge_submissions (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  proof_text text not null default '',
  created_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Habit Museum — initial schema, RLS, and policies
-- Run in Supabase SQL editor or via CLI migrations

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.habit_category as enum ('body', 'mind', 'productivity');
create type public.intention_status as enum ('done', 'partial', 'not_done');

-- profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category public.habit_category not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index habits_user_active_idx on public.habits (user_id) where is_active = true;

-- weekly_goals
create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  week_number int not null check (week_number >= 1 and week_number <= 53),
  year int not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name, week_number, year)
);

-- daily_checkins
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  sleep_quality int not null check (sleep_quality >= 0 and sleep_quality <= 100),
  energy int not null check (energy >= 1 and energy <= 10),
  mood int not null check (mood >= 1 and mood <= 10),
  journal_note text,
  gratitude_note text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- habit_completions
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, date)
);

create index habit_completions_user_date_idx on public.habit_completions (user_id, date);

-- daily_intentions
create table public.daily_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  intention_text text not null default '',
  status public.intention_status,
  created_at timestamptz not null default now()
);

create index daily_intentions_user_date_idx on public.daily_intentions (user_id, date);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.habit_completions enable row level security;
alter table public.daily_intentions enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- habits
create policy "habits_select_own"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "habits_insert_own"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "habits_update_own"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habits_delete_own"
  on public.habits for delete
  using (auth.uid() = user_id);

-- weekly_goals
create policy "weekly_goals_select_own"
  on public.weekly_goals for select
  using (auth.uid() = user_id);

create policy "weekly_goals_insert_own"
  on public.weekly_goals for insert
  with check (auth.uid() = user_id);

create policy "weekly_goals_update_own"
  on public.weekly_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly_goals_delete_own"
  on public.weekly_goals for delete
  using (auth.uid() = user_id);

-- daily_checkins
create policy "daily_checkins_select_own"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "daily_checkins_update_own"
  on public.daily_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
  on public.daily_checkins for delete
  using (auth.uid() = user_id);

-- habit_completions
create policy "habit_completions_select_own"
  on public.habit_completions for select
  using (auth.uid() = user_id);

create policy "habit_completions_insert_own"
  on public.habit_completions for insert
  with check (auth.uid() = user_id);

create policy "habit_completions_update_own"
  on public.habit_completions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habit_completions_delete_own"
  on public.habit_completions for delete
  using (auth.uid() = user_id);

-- daily_intentions
create policy "daily_intentions_select_own"
  on public.daily_intentions for select
  using (auth.uid() = user_id);

create policy "daily_intentions_insert_own"
  on public.daily_intentions for insert
  with check (auth.uid() = user_id);

create policy "daily_intentions_update_own"
  on public.daily_intentions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_intentions_delete_own"
  on public.daily_intentions for delete
  using (auth.uid() = user_id);
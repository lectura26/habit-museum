-- Align schema with Habit Museum app v2
-- Adds/renames columns to match the TypeScript types used in the application.

-- ──────────────────────────────────────────────────────────────────
-- profiles: change PK to be the user's auth.users id directly
-- The app queries profiles by `id = user.id`, not by `user_id`.
-- We add `id` as an alias and rename columns to match.
-- ──────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists id uuid unique,
  add column if not exists full_name text,
  add column if not exists language text not null default 'en',
  add column if not exists default_todo_count int not null default 3;

-- Back-fill id from user_id
update public.profiles set id = user_id where id is null;

-- Add display_order to habits
alter table public.habits
  add column if not exists display_order int not null default 0;

-- Remove category requirement (app uses name-only habits)
alter table public.habits
  alter column category drop not null;

-- daily_intentions (to-do entries)
create table if not exists public.daily_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  task_text text not null,
  display_order int not null default 0,
  status text check (status in ('done', 'partial', 'not_done')),
  created_at timestamptz not null default now()
);

create index if not exists daily_intentions_user_date_idx
  on public.daily_intentions (user_id, date);

alter table public.daily_intentions enable row level security;

create policy "daily_intentions_select_own"
  on public.daily_intentions for select using (auth.uid() = user_id);
create policy "daily_intentions_insert_own"
  on public.daily_intentions for insert with check (auth.uid() = user_id);
create policy "daily_intentions_update_own"
  on public.daily_intentions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_intentions_delete_own"
  on public.daily_intentions for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────
-- user_metrics: add missing columns / rename
-- ──────────────────────────────────────────────────────────────────
alter table public.user_metrics
  add column if not exists name text,
  add column if not exists display_order int not null default 0,
  add column if not exists emotion_options_arr text[];

-- Back-fill name from metric_name
update public.user_metrics set name = metric_name where name is null;

-- Add yes_no to the metric_type enum
alter type public.metric_type add value if not exists 'yes_no';

-- ──────────────────────────────────────────────────────────────────
-- checkin_entries: add missing columns
-- ──────────────────────────────────────────────────────────────────
alter table public.checkin_entries
  add column if not exists value_boolean boolean,
  add column if not exists value_emotions_arr text[];

-- ──────────────────────────────────────────────────────────────────
-- weekly_reviews: add week_start column (date-based)
-- ──────────────────────────────────────────────────────────────────
alter table public.weekly_reviews
  add column if not exists week_start date,
  add column if not exists went_well text,
  add column if not exists focus_next text,
  add column if not exists goals jsonb not null default '[]'::jsonb;

-- ──────────────────────────────────────────────────────────────────
-- habit_completions: ensure date is text (matches app's ISO string)
-- ──────────────────────────────────────────────────────────────────
-- No change needed — date column already exists as date type.

-- ──────────────────────────────────────────────────────────────────
-- RLS policies for profiles
-- ──────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_upsert_own"
  on public.profiles for all using (auth.uid() = user_id);

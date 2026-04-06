-- Habit Museum restructure: metrics, check-in entries, weekly reviews, profile fields

-- Profile columns
alter table public.profiles
  add column if not exists default_daily_todos int not null default 3
    check (default_daily_todos >= 1 and default_daily_todos <= 10);

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default true;

update public.profiles p
set onboarding_completed = false
where not exists (
  select 1 from public.habits h where h.user_id = p.user_id
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, onboarding_completed, default_daily_todos)
  values (new.id, false, 3);
  return new;
end;
$$;

-- Metric type enum
create type public.metric_type as enum (
  'score_100',
  'score_10',
  'number',
  'emotions',
  'freetext'
);

-- user_metrics
create table public.user_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  metric_name text not null,
  metric_type public.metric_type not null,
  unit text,
  min_value int,
  max_value int,
  emotion_options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index user_metrics_user_active_idx on public.user_metrics (user_id) where is_active = true;

-- checkin_entries (per metric per day)
create table public.checkin_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  metric_id uuid not null references public.user_metrics (id) on delete cascade,
  date date not null,
  value_number numeric,
  value_text text,
  value_emotions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, metric_id, date)
);

create index checkin_entries_user_date_idx on public.checkin_entries (user_id, date);

-- weekly_reviews (completed_at set when user saves)
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_number int not null check (week_number >= 1 and week_number <= 53),
  year int not null,
  what_went_well text not null default '',
  focus_next_week text not null default '',
  completed_at timestamptz,
  unique (user_id, week_number, year)
);

-- RLS
alter table public.user_metrics enable row level security;
alter table public.checkin_entries enable row level security;
alter table public.weekly_reviews enable row level security;

-- user_metrics policies
create policy "user_metrics_select_own"
  on public.user_metrics for select using (auth.uid() = user_id);
create policy "user_metrics_insert_own"
  on public.user_metrics for insert with check (auth.uid() = user_id);
create policy "user_metrics_update_own"
  on public.user_metrics for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_metrics_delete_own"
  on public.user_metrics for delete using (auth.uid() = user_id);

-- checkin_entries policies
create policy "checkin_entries_select_own"
  on public.checkin_entries for select using (auth.uid() = user_id);
create policy "checkin_entries_insert_own"
  on public.checkin_entries for insert with check (auth.uid() = user_id);
create policy "checkin_entries_update_own"
  on public.checkin_entries for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checkin_entries_delete_own"
  on public.checkin_entries for delete using (auth.uid() = user_id);

-- weekly_reviews policies
create policy "weekly_reviews_select_own"
  on public.weekly_reviews for select using (auth.uid() = user_id);
create policy "weekly_reviews_insert_own"
  on public.weekly_reviews for insert with check (auth.uid() = user_id);
create policy "weekly_reviews_update_own"
  on public.weekly_reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_reviews_delete_own"
  on public.weekly_reviews for delete using (auth.uid() = user_id);

-- Migration: Initial Schema for Trenova MVP
-- Description: Creates the initial database schema including user profiles, training plans,
-- and all necessary enums, functions, triggers, and RLS policies.
-- Author: Trenova Team
-- Date: 2024-04-18

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create ENUM types
-- Training goals enum
create type public.user_goal as enum (
  'weight_loss',      -- Goal: Weight loss
  'muscle_gain',      -- Goal: Muscle gain
  'general_fitness',  -- Goal: General fitness
  'strength_increase' -- Goal: Strength increase
);

-- Experience levels enum
create type public.experience_level as enum (
  'beginner',     -- Level: Beginner
  'intermediate', -- Level: Intermediate
  'advanced'      -- Level: Advanced
);

-- Equipment access enum
create type public.equipment_access as enum (
  'none',       -- Access: No equipment
  'home_basic', -- Access: Basic home equipment
  'full_gym'    -- Access: Full gym
);

-- Gender options enum
create type public.user_gender as enum (
  'male',
  'female',
  'other',
  'prefer_not_to_say'
);

-- 2. Create Tables

-- Profiles table
create table public.profiles (
  -- Core Fields & Relation
  id uuid not null primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- User Preferences / Profile Data
  gender public.user_gender,
  goal public.user_goal,
  experience public.experience_level,
  days_per_week smallint check (days_per_week >= 1 and days_per_week <= 7),
  session_duration_minutes smallint check (session_duration_minutes in (30, 45, 60, 90)),
  equipment public.equipment_access,
  restrictions text[] not null default '{}',
  meets_age_requirement boolean not null default false
);

-- Add table and column comments
comment on table public.profiles is 'Stores user profile information and training preferences, linked to auth.users.';
comment on column public.profiles.id is 'User ID, references auth.users.id.';
comment on column public.profiles.updated_at is 'Timestamp of the last profile update, managed by trigger.';
comment on column public.profiles.goal is 'Primary training goal selected by the user.';
comment on column public.profiles.experience is 'Self-reported training experience level.';
comment on column public.profiles.days_per_week is 'Number of days per week the user plans to train.';
comment on column public.profiles.session_duration_minutes is 'Preferred duration of a single training session in minutes.';
comment on column public.profiles.equipment is 'Level of access to training equipment.';
comment on column public.profiles.restrictions is 'List of any health restrictions or limitations provided by the user.';
comment on column public.profiles.meets_age_requirement is 'Indicates if the user confirmed they meet the minimum age requirement (>= 16).';

-- Training plans table
create table public.training_plans (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Plan Details
  name text not null,
  plan_details jsonb not null,
  preferences_snapshot jsonb not null
);

-- Add table and column comments
comment on table public.training_plans is 'Stores AI-generated training plans for users.';
comment on column public.training_plans.user_id is 'The user associated with this training plan.';
comment on column public.training_plans.name is 'User-editable name for the training plan.';
comment on column public.training_plans.plan_details is 'JSONB structure containing the detailed workout schedule and exercises.';
comment on column public.training_plans.preferences_snapshot is 'JSONB snapshot of key user preferences used to generate this specific plan.';

-- Create index for optimizing recent plans fetch
create index idx_training_plans_user_created_at
on public.training_plans (user_id, created_at desc);

-- 3. Create Functions and Triggers

-- Function to handle updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Create triggers
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS)

-- Enable RLS on tables
alter table public.profiles enable row level security;
alter table public.training_plans enable row level security;

-- Grant access to tables
grant all on table public.profiles to anon, authenticated;
grant all on table public.training_plans to anon, authenticated;

-- RLS Policies for profiles table

-- Select policy for profiles
create policy "Allow individual user access to own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Update policy for profiles
create policy "Allow individual user update access to own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- RLS Policies for training_plans table

-- Select policy for training plans
create policy "Allow individual user access to own plans"
on public.training_plans
for select
using (auth.uid() = user_id);

-- Insert policy for training plans
create policy "Allow individual user insert access for own plans"
on public.training_plans
for insert
with check (auth.uid() = user_id);

-- Update policy for training plans
create policy "Allow individual user update access to own plans"
on public.training_plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Delete policy for training plans
create policy "Allow individual user delete access to own plans"
on public.training_plans
for delete
using (auth.uid() = user_id);
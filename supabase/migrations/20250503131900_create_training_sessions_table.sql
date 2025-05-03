-- Supabase Migration: Create training_sessions table
--
-- Purpose: Creates the table to store records of completed user workout sessions.
-- Affected Tables: public.training_sessions
-- Related Tables: auth.users, public.training_plans
--
-- This migration sets up the structure for tracking basic workout completion,
-- including duration and the specific day of the plan completed.
-- It also establishes foreign key relationships and enables Row Level Security.

-- create the training_sessions table
create table public.training_sessions (
    id uuid not null primary key default gen_random_uuid(), -- unique identifier for the session record
    user_id uuid not null references auth.users(id) on delete cascade, -- user who completed the session
    plan_id uuid not null references public.training_plans(id) on delete cascade, -- the plan this session belongs to
    completed_at timestamptz not null, -- timestamp when the session was marked as fully completed
    plan_day_name text not null, -- name of the specific day from the training plan (e.g., "Day 1 - Chest & Triceps")
    duration_seconds integer not null check (duration_seconds > 0), -- total duration of the workout session in seconds
    created_at timestamptz not null default now() -- timestamp when the record was created (useful for auditing)
);

-- add comments to the table and columns for clarity
comment on table public.training_sessions is 'Stores records of completed workout sessions.';
comment on column public.training_sessions.id is 'Unique identifier for the session record.';
comment on column public.training_sessions.user_id is 'The user who completed this session. References auth.users and cascades deletes.';
comment on column public.training_sessions.plan_id is 'The training plan this session is part of. References public.training_plans and cascades deletes.';
comment on column public.training_sessions.completed_at is 'Timestamp recorded when the user marked the final exercise of the session as complete.';
comment on column public.training_sessions.plan_day_name is 'The name of the specific day within the plan that was completed (denormalized for easier history display).';
comment on column public.training_sessions.duration_seconds is 'Total time spent in the session, from start to completion, in seconds. Must be positive.';
comment on column public.training_sessions.created_at is 'Timestamp indicating when this session record was inserted into the database.';

-- enable row level security (rls) for the table
-- important: rls is enabled by default to ensure data privacy.
-- policies must be created to grant access.
alter table public.training_sessions enable row level security;

-- grant initial permissions
-- these grant statements allow the specified roles to perform actions *if* allowed by rls policies.
-- they do not bypass rls.
grant select, insert, update, delete on table public.training_sessions to authenticated;
grant all on table public.training_sessions to service_role; -- service_role bypasses rls

-- policies for 'training_sessions' table for authenticated users

-- policy: allow authenticated users to select their own sessions
-- rationale: users need to view their workout history.
drop policy if exists "allow authenticated user select own sessions" on public.training_sessions;
create policy "allow authenticated user select own sessions"
    on public.training_sessions
    for select
    to authenticated
    using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own sessions
-- rationale: users need to save completed sessions.
-- the check clause ensures a user cannot insert a session for another user.
drop policy if exists "allow authenticated user insert own sessions" on public.training_sessions;
create policy "allow authenticated user insert own sessions"
    on public.training_sessions
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- policy: allow authenticated users to delete their own sessions
-- rationale: although cascade delete from training_plans is the primary mechanism,
-- this allows direct deletion if needed in the future.
drop policy if exists "allow authenticated user delete own sessions" on public.training_sessions;
create policy "allow authenticated user delete own sessions"
    on public.training_sessions
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- note: update policy is intentionally omitted for mvp as sessions are considered immutable once created.

-- policies for 'training_sessions' table for anonymous users (anon role)

-- note: anonymous users should not have any access to training sessions data.
-- no policies are created for the 'anon' role, effectively denying all access.


-- create indexes for performance optimization

-- index: optimize fetching session history for a user, ordered by completion date.
-- rationale: common query pattern for displaying user's workout history.
create index idx_training_sessions_user_completed_at
    on public.training_sessions (user_id, completed_at desc);

-- index: ensure index exists for plan_id lookups and foreign key constraints.
-- rationale: supports cascading deletes and potentially joining with training_plans.
-- this might be created automatically by the foreign key constraint, but explicitly creating it ensures it exists.
create index idx_training_sessions_plan_id
    on public.training_sessions (plan_id); 
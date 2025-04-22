-- Migration: Remove User Profiles Feature
-- Description: This migration removes the public.profiles table, associated triggers, functions, RLS policies,
--              and related ENUM types as the user profile feature is being deprecated.
--              It also removes the preferences_snapshot column from public.training_plans.
-- Affected Tables/Objects:
-- - public.profiles (dropped)
-- - public.training_plans (column dropped)
-- - auth.users (trigger dropped)
-- - public.handle_updated_at (function dropped)
-- - public.handle_new_user (function dropped)
-- - public.user_gender (type dropped)
-- - public.equipment_access (type dropped)
-- - public.experience_level (type dropped)
-- - public.user_goal (type dropped)

-- Step 1: Drop triggers and functions associated with profiles

-- Drop trigger that automatically updated 'updated_at' on profiles table
-- This trigger is no longer needed as the profiles table is being dropped.
-- Destructive action: Dropping trigger.
drop trigger if exists on_profile_updated on public.profiles;

-- Drop the function used by the 'on_profile_updated' trigger.
-- This function is no longer needed.
-- Destructive action: Dropping function.
drop function if exists public.handle_updated_at();

-- Drop trigger that automatically created a profile for a new user in auth.users
-- This trigger is no longer needed as profiles are removed.
-- Destructive action: Dropping trigger.
drop trigger if exists on_auth_user_created on auth.users;

-- Drop the function used by the 'on_auth_user_created' trigger.
-- This function is no longer needed.
-- Destructive action: Dropping function.
drop function if exists public.handle_new_user();

-- Step 2: Drop RLS policies for the profiles table
-- These policies controlled access to the profiles table, which is being dropped.

-- Drop policy allowing users to select their own profile
-- Destructive action: Removing access control policy before dropping table.
drop policy if exists "Allow individual user access to own profile" on public.profiles;

-- Drop policy allowing users to update their own profile
-- Destructive action: Removing access control policy before dropping table.
drop policy if exists "Allow individual user update access to own profile" on public.profiles;

-- Step 3: Drop the profiles table
-- Destructive action: This permanently removes the profiles table and all its data.
drop table if exists public.profiles;

-- Step 4: Remove the preferences snapshot column from training_plans
-- This column stored a snapshot of user preferences at the time of plan creation,
-- which is no longer required as preferences are not stored persistently.
-- Destructive action: This removes the column and its data from the training_plans table.
alter table public.training_plans
drop column if exists preferences_snapshot;

-- Step 5: Drop ENUM types previously used by the profiles table
-- These types are no longer referenced after dropping the profiles table and preferences_snapshot column.
-- Destructive action: Dropping types. Ensure no other objects depend on them.

drop type if exists public.user_gender;
drop type if exists public.equipment_access;
drop type if exists public.experience_level;
drop type if exists public.user_goal;

-- Migration complete: User profiles feature removed. 
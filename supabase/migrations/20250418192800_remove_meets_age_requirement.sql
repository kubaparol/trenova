-- Migration: Remove meets_age_requirement field from profiles table
-- Description: This field will now be handled on the frontend only
-- Author: Trenova Team
-- Date: 2024-04-18

-- Remove the meets_age_requirement column from the profiles table
ALTER TABLE public.profiles DROP COLUMN meets_age_requirement; 
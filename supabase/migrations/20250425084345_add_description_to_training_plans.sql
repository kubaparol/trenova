-- Add the new column 'description' to the 'training_plans' table
ALTER TABLE public.training_plans
ADD COLUMN description text NOT NULL DEFAULT ''; -- Added DEFAULT '' to handle existing rows

-- Add a comment to the new column
COMMENT ON COLUMN public.training_plans.description
IS 'AI-generated description of the training plan.';

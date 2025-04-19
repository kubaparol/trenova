import type {
  UpdateTrainingPlanNameInput,
  UpdateTrainingPlanNameOutput,
} from "@/types/api";
import { supabaseClient } from "@/db/supabase.server";

/**
 * Updates the name of a specific training plan for the currently authenticated user.
 * This function creates its own Supabase server client instance.
 *
 * @param input - An object containing the plan ID and the new name.
 * @returns A promise that resolves to the updated training plan's basic details.
 * @throws {Error} If the user is not authenticated, the plan is not found,
 *                 or if there's another error during database interaction.
 */
export async function updateTrainingPlanName(
  input: UpdateTrainingPlanNameInput
): Promise<UpdateTrainingPlanNameOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("training_plans")
    .update({ name: input.name })
    .eq("id", input.id)
    .select("id, name, created_at, user_id")
    .single();

  if (error) {
    throw new Error(`Database error during update: ${error.message}`);
  }

  if (!data) {
    throw new Error("Not Found");
  }

  return data;
}

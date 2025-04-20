"use server";

import type {
  DeleteTrainingPlanInput,
  DeleteTrainingPlanOutput,
} from "@/types/api";
import { supabaseClient } from "@/db/supabase.server";

/**
 * Deletes a specific training plan for the currently authenticated user.
 * This function creates its own Supabase server client instance.
 *
 * @param input - An object containing the ID of the plan to delete.
 * @returns A promise that resolves to an object with a success message.
 * @throws {Error} "Unauthorized" - If the user is not authenticated.
 * @throws {Error} "Not Found" - If the plan with the given ID doesn't exist or the user doesn't have permission (RLS).
 * @throws {Error} "Database error: ..." - If there's an error during the database operation.
 */
export async function deleteTrainingPlan(
  input: DeleteTrainingPlanInput
): Promise<DeleteTrainingPlanOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("training_plans")
    .delete()
    .eq("id", input.id);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { message: "Training plan deleted successfully." };
}

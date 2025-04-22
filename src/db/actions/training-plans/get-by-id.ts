"use server";

import type {
  GetTrainingPlanInput,
  TrainingPlanDetailOutput,
  PlanDetails,
} from "@/types/api";
import { supabaseClient } from "@/db/supabase.server";

/**
 * Retrieves a specific training plan with full details for the currently authenticated user.
 * This function creates its own Supabase server client instance.
 *
 * @param input - Object containing the ID of the training plan to retrieve.
 * @param input.id - The UUID of the training plan.
 * @returns A promise that resolves to the detailed training plan.
 * @throws {Error} If the user is not authenticated, the plan is not found,
 *                 the user does not have access, or a database error occurs.
 */
export async function getTrainingPlanById(
  input: GetTrainingPlanInput
): Promise<TrainingPlanDetailOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }
  const userId = user.id;

  const { data: planData, error: dbError } = await supabase
    .from("training_plans")
    .select("id, name, created_at, user_id, plan_details")
    .eq("id", input.id)
    .eq("user_id", userId)
    .single();

  if (dbError) {
    if (dbError.code === "PGRST116") {
      throw new Error("Training plan not found or access denied");
    } else {
      throw new Error(`Failed to retrieve training plan: ${dbError.message}`);
    }
  }

  return {
    id: planData.id,
    name: planData.name,
    created_at: planData.created_at,
    user_id: planData.user_id,
    plan_details: planData.plan_details as unknown as PlanDetails,
  };
}

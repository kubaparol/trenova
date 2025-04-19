import type {
  GetUserPlansInput,
  TrainingPlanListOutput,
  TrainingPlanListItem,
} from "@/types";
import { supabaseClient } from "@/db/supabase.server";

/**
 * Retrieves a paginated list of training plans for the **currently authenticated user**.
 * This function creates its own Supabase server client instance.
 *
 * @param options - Optional pagination parameters (page, limit).
 * @returns A promise that resolves to the paginated list of training plans.
 * @throws {Error} If the user is not authenticated or if there's an error during database interaction.
 */
export async function getUserTrainingPlans(
  options?: GetUserPlansInput
): Promise<TrainingPlanListOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated.");
  }
  const userId = user.id;

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  if (page < 1 || limit < 1) {
    throw new Error("Page and limit must be positive integers.");
  }

  const offset = (page - 1) * limit;

  const { data: plansData, error: plansError } = await supabase
    .from("training_plans")
    .select("id, name, created_at, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { count, error: countError } = await supabase
    .from("training_plans")
    .select("count", { count: "exact", head: true })
    .eq("user_id", userId);

  if (plansError) {
    throw new Error(`Failed to fetch training plans: ${plansError.message}`);
  }
  if (countError) {
    throw new Error(`Failed to count training plans: ${countError.message}`);
  }

  const items: TrainingPlanListItem[] = plansData ?? [];
  const total: number = count ?? 0;

  return {
    items,
    total,
    page,
    limit,
  };
}

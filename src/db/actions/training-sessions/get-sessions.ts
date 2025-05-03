"use server";

import type {
  GetTrainingSessionsInput,
  TrainingSessionListOutput,
  TrainingSessionListItem,
} from "@/types";
import { supabaseClient } from "@/db/supabase.server";

/**
 * Retrieves a paginated list of completed training sessions for the
 * **currently authenticated user**, joining the associated training plan name.
 * This function creates its own Supabase server client instance.
 *
 * @param input - Optional pagination parameters (page, limit). Defaults to page 1, limit 10.
 * @returns A promise that resolves to the paginated list of training sessions.
 * @throws {Error} If the user is not authenticated, input is invalid (page/limit <= 0), or a database error occurs.
 */
export async function getTrainingSessions(
  input?: GetTrainingSessionsInput
): Promise<TrainingSessionListOutput> {
  // 4. Validate input and set defaults
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;
  // const MAX_LIMIT = 100; // Consider uncommenting and using if needed

  if (page < 1) {
    throw new Error("Invalid input: Page must be a positive integer.");
  }
  if (limit < 1) {
    throw new Error("Invalid input: Limit must be a positive integer.");
  }
  // if (limit > MAX_LIMIT) {
  //   throw new Error(`Invalid input: Limit cannot exceed ${MAX_LIMIT}.`);
  // }

  const offset = (page - 1) * limit;

  // 5. Create Supabase client
  const supabase = await supabaseClient();

  // 6. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Following example get-user-plans.ts message convention
    throw new Error("User not authenticated.");
  }
  const userId = user.id;

  // 7. Execute Database Query
  let query = supabase
    .from("training_sessions")
    .select(
      `
      id,
      completed_at,
      plan_day_name,
      duration_seconds,
      plan_id,
      training_plans!inner ( name )
    `,
      { count: "exact" } // Get total count matching the query
    )
    .eq("user_id", userId); // Filter by authenticated user

  // Add optional plan_id filter
  if (input?.plan_id) {
    query = query.eq("plan_id", input.plan_id);
  }

  const {
    data: rawData,
    error,
    count,
  } = await query
    .order("completed_at", { ascending: false }) // Sort by newest first
    .range(offset, offset + limit - 1); // Apply pagination

  // 8. Handle Query Error
  if (error) {
    // Log the detailed error for debugging on the server
    console.error("Database error fetching training sessions:", error);
    // Throw a more generic error to the client/caller
    throw new Error(`Database error: ${error.message}`);
  }

  // 9. Verify Data (count is the primary check here)
  if (count === null) {
    // This indicates an issue with the count query itself
    console.error("Database error: Failed to retrieve session count.");
    throw new Error("Database error: Failed to count training sessions.");
  }

  // 10. Map Results
  // Type assertion needed as Supabase types the joined data generically
  const items: TrainingSessionListItem[] = (rawData ?? []).map((session) => ({
    id: session.id,
    completed_at: session.completed_at,
    plan_day_name: session.plan_day_name,
    duration_seconds: session.duration_seconds,
    plan_id: session.plan_id,
    // Safely access the joined plan name
    plan_name: session.training_plans?.name ?? undefined,
  }));

  // 11. Construct Response
  const response: TrainingSessionListOutput = {
    items,
    total: count, // Use the exact count from the query
    page,
    limit,
  };

  // 12. Return Success
  return response;
}

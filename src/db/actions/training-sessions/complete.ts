import type {
  CompleteTrainingSessionInput,
  CompleteTrainingSessionOutput,
} from "@/types/api";
import { supabaseClient } from "@/db/supabase.server";
import { z, ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { ProjectUrls } from "@/constants";

export const CompleteTrainingSessionInputSchema = z.object({
  plan_id: z.string().uuid({ message: "Invalid Plan ID format." }),
  plan_day_name: z
    .string()
    .min(1, { message: "Plan day name cannot be empty." }),
  duration_seconds: z
    .number()
    .int()
    .positive({ message: "Duration must be a positive integer." }),
});

/**
 * Saves a completed training session record for the currently authenticated user.
 *
 * @param input - The details of the completed session (plan_id, plan_day_name, duration_seconds).
 * @returns A promise that resolves to the ID of the new session record and a success message.
 * @throws {Error} If input validation fails ("Invalid input: ...").
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the specified plan is not found or the user lacks access ("Plan not found or access denied").
 * @throws {Error} If a database error occurs ("Database error: ...").
 */
export async function completeTrainingSession(
  input: CompleteTrainingSessionInput
): Promise<CompleteTrainingSessionOutput> {
  // 4. Input Validation
  try {
    CompleteTrainingSessionInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(
        `Invalid input: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    // Re-throw other unexpected errors during parsing
    throw error;
  }

  // 5. Create Supabase Client
  const supabase = await supabaseClient();

  // 6. Authentication Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }
  const userId = user.id;

  // 7. Verify Plan Access (Optional but Recommended)
  const { data: planData, error: planError } = await supabase
    .from("training_plans")
    .select("id")
    .eq("id", input.plan_id)
    .eq("user_id", userId) // Ensure the plan belongs to the user
    .maybeSingle();

  if (planError || !planData) {
    // If there's an error fetching or the plan doesn't exist/belong to the user
    throw new Error("Plan not found or access denied");
  }

  // 8. Prepare Data for Insert
  const dataToInsert = {
    user_id: userId,
    plan_id: input.plan_id,
    plan_day_name: input.plan_day_name,
    duration_seconds: input.duration_seconds,
    completed_at: new Date().toISOString(), // Use current timestamp
  };

  // 9. Database Insert Operation
  const { data: insertedSession, error: insertError } = await supabase
    .from("training_sessions")
    .insert(dataToInsert)
    .select("id") // Select the ID of the newly inserted row
    .single(); // Expect exactly one row back

  // Handle potential insertion errors
  if (insertError) {
    // Log the detailed error for server-side debugging
    console.error("Supabase insert error:", insertError);
    // Provide a generic error message to the client
    throw new Error(`Database error: ${insertError.message}`);
  }

  // This check is theoretically redundant with .single() but good practice
  if (!insertedSession) {
    throw new Error("Database error: Failed to retrieve inserted session ID");
  }

  revalidatePath(ProjectUrls.trainingPlan(input.plan_id));
  revalidatePath(ProjectUrls.trainingHistory);

  // 10. Format and Return Success Response
  return {
    id: insertedSession.id,
    message: "Session completed successfully",
  };
}

"use server";

import type {
  CreateTrainingPlanInput,
  PlanDetails,
  TrainingPlanDetailOutput,
  TrainingPreferences,
} from "@/types/api";
import { supabaseClient } from "@/db/supabase.server";
import { OpenRouterService } from "@/lib/services/openrouter.service";
import { OpenRouterApiError } from "@/lib/services/openrouter.error";
import { Json } from "@/db/database.types"; // Import Json type

// Helper function to create the AI prompt (can be moved later if needed)
function createAIPrompt(preferences: TrainingPreferences): string {
  // TODO: Refine this prompt for better results and safety
  // TODO: Consider using a more robust templating method if prompt becomes complex
  return `
Generate a detailed weekly workout plan based on the following user preferences.
Return the response ONLY as a JSON object conforming to this TypeScript interface:
\`\`\`typescript
interface Exercise {
  name: string; // e.g., "Bench Press", "Squats"
  sets: number; // e.g., 3
  repetitions: number; // e.g., 10
  rest_time_seconds: number; // e.g., 60
  duration_seconds?: number; // Optional: for timed exercises like Plank
  duration_minutes?: number; // Optional: for timed exercises
}

interface PlanDay {
  day: string; // e.g., "Monday", "Day 1", "Rest Day"
  exercises: Exercise[]; // Array of exercises for the day. Empty if it's a rest day.
}

interface PlanDetails {
  days: PlanDay[]; // Array representing the whole week or cycle
}
\`\`\`

User Preferences:
- Gender: ${preferences.gender}
- Experience Level: ${preferences.experience}
- Main Goal: ${preferences.goal}
- Days per week available for training: ${preferences.days_per_week}
- Preferred session duration (minutes): ${preferences.session_duration_minutes}
- Equipment available: ${preferences.equipment}
- Restrictions or notes: ${preferences.restrictions?.join(", ") || "None"}

Ensure the generated JSON is valid and directly parsable. Do not include any introductory text, explanations, or markdown formatting around the JSON object.
The JSON object should start with '{' and end with '}'.
`;
}

/**
 * Creates a new training plan for the currently authenticated user.
 *
 * This function performs the following steps:
 * 1. Creates a Supabase server client.
 * 2. Authenticates the user.
 * 3. Constructs a prompt and calls the OpenRouter AI API to generate plan details.
 * 4. Validates the AI response structure.
 * 5. Inserts the new training plan into the database, including a snapshot of the preferences.
 * 6. Returns the newly created training plan details.
 *
 * @param input - The input object containing the plan name and user preferences.
 * @returns A promise that resolves to the detailed output of the newly created training plan.
 * @throws {Error} "Unauthorized" - If the user is not authenticated.
 * @throws {Error} "AI generation error: [reason]" - If the AI API call fails or returns invalid data.
 * @throws {Error} "AI rate limit exceeded" - If the AI API rate limit is hit.
 * @throws {Error} "Database error: [Supabase error message]" - If the database insertion fails.
 */
export async function createTrainingPlan(
  input: CreateTrainingPlanInput
): Promise<TrainingPlanDetailOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error:", authError);
    throw new Error("Unauthorized");
  }
  const userId = user.id;

  let planDetails: PlanDetails;
  try {
    const openRouterService = new OpenRouterService();
    const prompt = createAIPrompt(input.preferences);

    const model = "openai/gpt-4o-mini";

    const aiResponse = await openRouterService.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert fitness coach. Generate workout plans based on user preferences and return ONLY valid JSON matching the requested structure.",
        },
        { role: "user", content: prompt },
      ],
      // response_format: { type: "json_object" }, // Removed as OpenRouterService expects json_schema
      // We rely on the prompt to request JSON output.
      // Optional: Add temperature, max_tokens etc. if needed
      // temperature: 0.7,
    });

    const rawContent = aiResponse.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("AI returned empty content.");
    }

    try {
      planDetails = JSON.parse(rawContent) as PlanDetails;
      if (
        !planDetails ||
        typeof planDetails !== "object" ||
        !Array.isArray(planDetails.days)
      ) {
        throw new Error("Invalid response structure received from AI.");
      }
    } catch {
      throw new Error("AI generation error: Invalid JSON response");
    }
  } catch (error) {
    if (error instanceof OpenRouterApiError && error.status === 429) {
      throw new Error("AI rate limit exceeded");
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`AI generation error: ${message}`);
  }

  const dataToInsert = {
    user_id: userId,
    name: input.name,
    plan_details: planDetails as unknown as Json,
  };

  const { data: insertedPlanData, error: insertError } = await supabase
    .from("training_plans")
    .insert(dataToInsert)
    .select()
    .single();

  if (insertError) {
    console.error("Database Insert Error:", insertError);
    throw new Error(`Database error: ${insertError.message}`);
  }

  if (!insertedPlanData) {
    throw new Error("Database error: Failed to retrieve inserted plan");
  }

  const planDetailsFromDb = insertedPlanData.plan_details;

  if (
    typeof planDetailsFromDb !== "object" ||
    planDetailsFromDb === null ||
    !planDetailsFromDb.hasOwnProperty("days") ||
    !Array.isArray((planDetailsFromDb as { days: unknown }).days)
  ) {
    throw new Error(
      "Database error: Returned plan data has unexpected structure"
    );
  }

  return insertedPlanData as unknown as TrainingPlanDetailOutput;
}

import type { Tables, Enums } from "@/db/database.types";

// --- Generic Types ---

/** Represents the basic user information, typically from auth.users */
export interface UserInfo {
  id: string;
  email: string;
}

// --- Authentication ---

/** Input for the sign-up action. */
export interface SignUpInput {
  email: string;
  password: string;
}

/** Input for the sign-in action. */
export interface SignInInput {
  email: string;
  password: string;
}

// --- User Profiles ---

/** Output for retrieving the current user's profile. Directly maps to the database row. */
export type ProfileOutput = Tables<"profiles">; // Using Tables<'profiles'> directly as Row is default

/** Input for updating the user's profile. Uses a subset of updateable fields. */
export type ProfileUpdateInput = Partial<
  Pick<
    Tables<"profiles">, // Pick from the Row type (default)
    | "gender"
    | "experience"
    | "goal"
    | "days_per_week"
    | "session_duration_minutes"
    | "equipment"
    | "restrictions"
  >
>;

/** Output for the account deletion request action. */
export interface DeletionRequestOutput {
  message: string;
  deletion_request_id: string;
}

// --- Training Plans ---

/** Input for fetching user training plans with pagination. */
export interface GetUserPlansInput {
  page?: number;
  limit?: number;
}

/** Represents a single training plan item in a list. Derived from training_plans table. */
export type TrainingPlanListItem = Pick<
  Tables<"training_plans">, // Defaults to Row type
  "id" | "name" | "created_at" | "user_id"
>;

/** Output for fetching a list of user training plans. */
export interface TrainingPlanListOutput {
  items: TrainingPlanListItem[];
  total: number;
  page: number;
  limit: number;
}

/** Input for fetching a specific training plan by ID. */
export interface GetTrainingPlanInput {
  id: string;
}

/** Represents a detailed exercise within a training plan day. */
export interface Exercise {
  name: string;
  sets: number;
  repetitions: number;
  rest_time_seconds: number;
  duration_seconds?: number;
  duration_minutes?: number;
}

/** Represents a single day's workout in a training plan. */
export interface PlanDay {
  day: string; // e.g., "Monday", "Day 1"
  exercises: Exercise[];
}

/** Defines the structure for the 'plan_details' JSON field in the training_plans table. */
export interface PlanDetails {
  days: PlanDay[];
}

/** Defines the structure for training preferences, used in creation and as a snapshot. References database Enums. */
export interface TrainingPreferences {
  gender: Enums<"user_gender">;
  experience: Enums<"experience_level">;
  goal: Enums<"user_goal">;
  days_per_week: number;
  session_duration_minutes: number;
  equipment: Enums<"equipment_access">;
  restrictions: string[];
}

/**
 * Output for fetching a detailed training plan.
 * Derives from the base training_plans table row but provides specific types
 * for the JSON fields 'plan_details' and 'preferences_snapshot'.
 */
export type TrainingPlanDetailOutput = Pick<
  Tables<"training_plans">,
  "id" | "name" | "created_at" | "user_id"
> & {
  plan_details: PlanDetails;
  preferences_snapshot: TrainingPreferences; // Reuse TrainingPreferences for the snapshot
};

/** Input for creating a new training plan. */
export interface CreateTrainingPlanInput {
  name: string;
  preferences: TrainingPreferences;
}

/** Input for updating a training plan's name. */
export interface UpdateTrainingPlanNameInput {
  id: string; // Training plan ID
  name: string; // New name
}

/** Output after successfully updating a training plan's name. */
export type UpdateTrainingPlanNameOutput = TrainingPlanListItem; // Reuses the list item structure

/** Input for deleting a training plan. */
export interface DeleteTrainingPlanInput {
  id: string; // ID of the plan to delete
}

/** Output after successfully deleting a training plan. */
export interface DeleteTrainingPlanOutput {
  message: string;
}

// --- Support ---

/** Input for submitting a support request. */
export interface SupportRequestInput {
  email: string;
  subject: string;
  message: string;
}

/** Output after submitting a support request. */
export interface SupportRequestOutput {
  id: string; // ID assigned to the support request
  message: string;
}

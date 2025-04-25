import type { Tables } from "@/db/database.types";

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

/** Input for the change password action. */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/** Output for the change password action. */
export interface ChangePasswordOutput {
  message: string;
}

/** Output for deleting the account. */
export interface DeleteAccountOutput {
  message: string;
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
  description: string;
}

/** Defines the structure for training preferences, used only during plan creation. */
export interface TrainingPreferences {
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  experience: "beginner" | "intermediate" | "advanced";
  goal: "weight_loss" | "muscle_gain" | "general_fitness" | "strength_increase";
  days_per_week: number; // Assuming 1-7
  session_duration_minutes: number; // Assuming 15-120
  equipment: "none" | "home_basic" | "full_gym";
  restrictions: string[];
}

/**
 * Output for fetching a detailed training plan.
 * Derives from the base training_plans table row but provides specific types
 * for the JSON field 'plan_details'.
 */
export type TrainingPlanDetailOutput = Pick<
  Tables<"training_plans">,
  "id" | "name" | "created_at" | "user_id" | "description"
> & {
  plan_details: PlanDetails;
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

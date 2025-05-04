# Server Actions Plan for Trenova

## 1. Resources

| Resource         | Database Table           | Description                                      |
| ---------------- | ------------------------ | ------------------------------------------------ |
| Users            | auth.users               | User authentication managed by Supabase Auth     |
| TrainingPlans    | public.training_plans    | User's saved training plans                      |
| TrainingSessions | public.training_sessions | User's completed workout session history records |

## 2. Server Actions

### Authentication

| Action Name          | File Path                                     | Description               |
| -------------------- | --------------------------------------------- | ------------------------- |
| signUp               | src/db/actions/auth/signup.ts                 | Register a new user       |
| signIn               | src/db/actions/auth/signin.ts                 | Sign in a user            |
| signOut              | src/db/actions/auth/signout.ts                | Sign out a user           |
| requestPasswordReset | src/db/actions/auth/request-password-reset.ts | Request password reset    |
| resetPassword        | src/db/actions/auth/reset-password.ts         | Reset password with token |
| changePassword       | src/db/actions/auth/change-password.ts        | Change user's password    |

#### signUp (src/db/actions/auth/signup.ts)

Creates a new user account and profile.

**Input:**

```typescript
type SignUpInput = {
  email: string;
  password: string;
};
```

**Output:**

```typescript
type SignUpOutput = {
  id: string;
  email: string;
};
```

**Errors:**

- 400: Invalid input (email format, password strength)
- 409: Email already in use

#### signIn (src/db/actions/auth/signin.ts)

Authenticates a user.

**Input:**

```typescript
type SignInInput = {
  email: string;
  password: string;
};
```

**Output:**

```typescript
type SignInOutput = {
  user: {
    id: string;
    email: string;
  };
};
```

**Errors:**

- 400: Invalid credentials
- 401: Authentication failed

#### changePassword (src/db/actions/auth/change-password.ts)

Changes the logged-in user's password.

**Input:**

```typescript
type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
```

**Output:**

```typescript
type ChangePasswordOutput = {
  message: string;
};
```

**Errors:**

- 400: Invalid input (password mismatch, new password strength)
- 401: Unauthorized
- 403: Current password incorrect

### Training Plans

| Action Name            | File Path                                       | Description                                       |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------- |
| getUserTrainingPlans   | src/db/actions/training-plans/get-user-plans.ts | Get all training plans for the current user       |
| getTrainingPlanById    | src/db/actions/training-plans/get-by-id.ts      | Get a specific training plan                      |
| createTrainingPlan     | src/db/actions/training-plans/create.ts         | Create a new training plan using AI               |
| updateTrainingPlanName | src/db/actions/training-plans/update-name.ts    | Update a training plan's name                     |
| deleteTrainingPlan     | src/db/actions/training-plans/delete.ts         | Delete a training plan (cascades to sessions)     |
| deleteAccount          | src/db/actions/auth/delete-account.ts           | Delete the user's account and all associated data |

#### getUserTrainingPlans (src/db/actions/training-plans/get-user-plans.ts)

Retrieves all training plans for the current user.

**Input:**

```typescript
type GetUserPlansInput = {
  page?: number; // default: 1
  limit?: number; // default: 10
};
```

**Output:**

```typescript
type TrainingPlanListOutput = {
  items: {
    id: string;
    name: string;
    created_at: string;
    user_id: string;
  }[];
  total: number;
  page: number;
  limit: number;
};
```

**Errors:**

- 401: Unauthorized
- 403: Forbidden
- 404: Plan not found

#### getTrainingPlanById (src/db/actions/training-plans/get-by-id.ts)

Retrieves a specific training plan with full details.

**Input:**

```typescript
type GetTrainingPlanInput = {
  id: string;
};
```

**Output:**

```typescript
type TrainingPlanDetailOutput = {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  description: string;
  plan_details: {
    days: {
      day: string;
      exercises: {
        name: string;
        sets: number;
        repetitions: number;
        rest_time_seconds: number;
        duration_seconds?: number;
        duration_minutes?: number;
      }[];
    }[];
  };
  preferences_snapshot: {
    gender: string;
    experience: string;
    goal: string;
    days_per_week: number;
    session_duration_minutes: number;
    equipment: string;
    restrictions: string[];
  };
};
```

**Errors:**

- 401: Unauthorized
- 403: Forbidden (not user's plan)
- 404: Plan not found

#### createTrainingPlan (src/db/actions/training-plans/create.ts)

Creates a new training plan using AI based on provided preferences.

**Input:**

```typescript
type CreateTrainingPlanInput = {
  name: string;
  preferences: {
    gender: "male" | "female" | "other" | "prefer_not_to_say";
    experience: "beginner" | "intermediate" | "advanced";
    goal:
      | "weight_loss"
      | "muscle_gain"
      | "general_fitness"
      | "strength_increase";
    days_per_week: number;
    session_duration_minutes: number;
    equipment: "none" | "home_basic" | "full_gym";
    restrictions: string[];
  };
};
```

**Output:**

```typescript
type TrainingPlanDetailOutput = {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  description: string;
  plan_details: {
    days: {
      day: string;
      exercises: {
        name: string;
        sets: number;
        repetitions: number;
        rest_time_seconds: number;
        duration_seconds?: number;
        duration_minutes?: number;
      }[];
    }[];
  };
  // preferences_snapshot removed as preferences are not persistently stored per-plan
};
```

**Errors:**

- 400: Invalid input
- 401: Unauthorized
- 404: Plan not found
- 429: Too many requests (AI generation rate limit)
- 500: AI generation error

#### updateTrainingPlanName (src/db/actions/training-plans/update-name.ts)

Updates a training plan's name.

**Input:**

```typescript
type UpdateTrainingPlanNameInput = {
  id: string;
  name: string;
};
```

**Output:**

```typescript
type UpdateTrainingPlanNameOutput = {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
};
```

**Errors:**

- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (not user's plan)
- 404: Plan not found

#### deleteTrainingPlan (src/db/actions/training-plans/delete.ts)

Deletes a specific training plan. Associated records in `training_sessions` are automatically deleted due to the `ON DELETE CASCADE` foreign key constraint.

**Input:**

```typescript
type DeleteTrainingPlanInput = {
  id: string;
};
```

**Output:**

```typescript
type DeleteTrainingPlanOutput = {
  message: string;
};
```

**Errors:**

- 401: Unauthorized
- 403: Forbidden (not user's plan)
- 404: Plan not found

#### submitSupportRequest (src/db/actions/support/submit-request.ts)

Submits a support request.

**Input:**

```typescript
type SupportRequestInput = {
  email: string;
  subject: string;
  message: string;
};
```

**Output:**

```typescript
type SupportRequestOutput = {
  id: string;
  message: string;
};
```

**Errors:**

- 400: Invalid input

#### deleteAccount (src/db/actions/auth/delete-account.ts)

Deletes the user's account and all associated data (including training plans) immediately.

**Input:** None (uses session context; performs immediate deletion after confirmation)

**Output:**

```typescript
type DeleteAccountOutput = {
  message: string;
};
```

**Errors:**

- 401: Unauthorized

### Training Sessions

| Action Name             | File Path                                        | Description                           |
| ----------------------- | ------------------------------------------------ | ------------------------------------- |
| completeTrainingSession | src/db/actions/training-sessions/complete.ts     | Save a completed training session     |
| getTrainingSessions     | src/db/actions/training-sessions/get-sessions.ts | Get the user's session history (list) |

#### completeTrainingSession (src/db/actions/training-sessions/complete.ts)

Saves the details of a fully completed training session for a specific day of a plan.

**Input:**

```typescript
type CompleteTrainingSessionInput = {
  plan_id: string; // ID of the plan the session belongs to
  plan_day_name: string; // Name of the specific day completed (e.g., "Day 1 - Chest")
  duration_seconds: number; // Total duration of the session in seconds
};
```

**Output:**

```typescript
type CompleteTrainingSessionOutput = {
  id: string; // The ID of the newly created training_sessions record
  message: string;
};
```

**Errors:**

- 400: Invalid input (e.g., duration <= 0, missing fields)
- 401: Unauthorized
- 403: Forbidden (e.g., trying to save session for a plan not owned by user)
- 404: Plan not found (referenced `plan_id` does not exist)
- 500: Database error during insert

#### getTrainingSessions (src/db/actions/training-sessions/get-sessions.ts)

Retrieves the history of completed training sessions for the current user, with pagination.

**Input:**

```typescript
type GetTrainingSessionsInput = {
  page?: number; // default: 1
  limit?: number; // default: 10
};
```

**Output:**

```typescript
type TrainingSessionListOutput = {
  items: {
    id: string;
    completed_at: string;
    plan_day_name: string;
    duration_seconds: number;
    plan_id: string;
    plan_name?: string; // Requires join with training_plans
  }[];
  total: number;
  page: number;
  limit: number;
};
```

**Errors:**

- 401: Unauthorized
- 403: Forbidden
- 500: Database error during select

## 3. Authentication and Authorization

Trenova will use Supabase Authentication services for handling user authentication, which will be integrated with Next.js Server Actions:

1. **JWT-based authentication**: Users receive a JWT token upon successful login, managed by Supabase
2. **Secure password handling**: Passwords are hashed and never stored in plain text
3. **Email verification**: Automatic email verification flow
4. **Password reset**: Secure password reset functionality

**Authentication Flow:**

1. Users register or log in through the provided server actions
2. Successful authentication creates a session managed by Supabase Auth
3. Server actions use the Supabase client to access the current session
4. Server actions verify authentication status before processing requests

**Authorization:**

- Row-Level Security (RLS) policies in Supabase ensure users can only access their own data (training plans, training sessions)
- Server actions verify user permissions before performing operations
- Middleware checks authentication status for protected routes

### Dashboard

| Action Name          | File Path                                      | Description                                     |
| -------------------- | ---------------------------------------------- | ----------------------------------------------- |
| getUserDashboardData | src/db/actions/dashboard/get-user-dashboard.ts | Get aggregated data for the User Dashboard view |

#### getUserDashboardData (src/db/actions/dashboard/get-user-dashboard.ts)

Retrieves all necessary aggregated data for displaying the User Dashboard widgets for the currently authenticated user.

**Input:** None (Uses user context)

**Output:**

```typescript
type UserDashboardDataOutput = {
  hasTrainingData: boolean; // Indicates if the user has any completed sessions
  lastSession?: {
    plan_name: string;
    completed_at: string; // ISO string format
    duration_seconds: number;
  } | null;
  weeklyProgress: {
    completed_count: number;
    goal: number; // Static goal (e.g., 5)
  };
  systematicsScore: {
    sessions_last_14_days: number;
    score: "very_good" | "good" | "average" | "poor";
  };
  trainingSummary: {
    completed_this_week: number; // Sessions in the current Mon-Sun week
    total_duration_seconds: number; // Sum of duration for all sessions
    longest_duration_seconds: number; // Max duration across all sessions
    average_duration_seconds: number; // Average duration across all sessions
  };
  charts: {
    durationTrend: {
      date: string; // ISO string date part
      duration_seconds: number;
    }[]; // Array of all sessions for the trend line
    workoutsByPlan: {
      plan_name: string;
      count: number;
    }[]; // Count of sessions grouped by plan name
  };
};
```

**Errors:**

- 401: Unauthorized
- 500: Database error during aggregation/select

## 4. Validation and Business Logic

### Training Plan Preferences Validation (Used during `createTrainingPlan`)

- Gender must be one of: "male", "female", "other", "prefer_not_to_say"
- Experience level must be one of: "beginner", "intermediate", "advanced"
- Goal must be one of: "weight_loss", "muscle_gain", "general_fitness", "strength_increase"
- Days per week must be between 1 and 7
- Session duration must be between 15 and 120 minutes
- Equipment must be one of: "none", "home_basic", "full_gym"
- Restrictions must be an array of valid restriction types

### Training Plan Validation

- Name must be between 1 and 255 characters
- User must be authenticated to create or manage training plans
- Users can only access their own training plans and sessions
- AI models receive structured preference data (provided in the `createTrainingPlan` call) and generate a complete workout plan
- Generated plans maintain a consistent structure for frontend rendering
- Rate limiting is applied to AI-generated content to prevent abuse
- All database operations use Supabase's data access APIs with RLS policies

### Training Session Validation

- `plan_id` must reference an existing `training_plans` record owned by the user.
- `plan_day_name` must be a non-empty string.
- `duration_seconds` must be a positive integer.
- User must be authenticated.

### Password Change Validation

- Current password must be provided and match the user's actual current password.
- New password must meet the strength requirements (same as registration).
- New password and confirmation must match.
- User must be authenticated.

### Business Logic Implementation

- Training plan generation uses OpenRouter.ai to connect to AI models
- Generated plans maintain a consistent structure for frontend rendering
- Rate limiting is applied to AI-generated content to prevent abuse
- All database operations use Supabase's data access APIs with RLS policies

## 5. Error Handling

All server actions will use consistent error handling with zod for validation and return typed errors:

```typescript
// Example error handling pattern
import { z } from "zod";

// Define input schema
const inputSchema = z.object({
  // schema definition
});

// Define custom error type
type ActionError = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

// Server action implementation
export async function serverAction(input: unknown) {
  try {
    // Validate input
    const validatedInput = inputSchema.parse(input);

    // Perform action

    // Return success result
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: {
          code: "invalid_input",
          message: "Invalid input",
          details: error.format(),
        },
      };
    }

    // Handle other specific errors...

    return {
      error: {
        code: "internal_error",
        message: "An unexpected error occurred",
      },
    };
  }
}
```

Common error codes include:

- `invalid_input`: Request validation failed
- `unauthorized`: Authentication required
- `forbidden`: Authenticated but not authorized
- `not_found`: Requested resource doesn't exist
- `rate_limited`: Too many requests
- `ai_generation_error`: Error during AI plan generation
- `internal_error`: Server encountered an unexpected error

## 6. Rate Limiting and Security

### Security Measures

- All endpoints served over HTTPS
- CSRF protection built into Next.js Server Actions
- Input validation with Zod to prevent injection attacks
- Request size limits to prevent denial of service attacks
- Supabase RLS policies for database-level access control
- Monitoring and logging of suspicious activities

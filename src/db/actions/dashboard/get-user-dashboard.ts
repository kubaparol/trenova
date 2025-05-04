import { supabaseClient } from "@/db/supabase.server";
import type { UserDashboardDataOutput } from "@/types";
import type { Tables } from "@/db/database.types";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type SessionWithPlanName = Tables<"training_sessions"> & {
  training_plans: { name: string } | null;
};

function getSystematicsScore(
  totalSessions: number,
  daysSinceFirstSession: number
): UserDashboardDataOutput["systematicsScore"]["score"] {
  if (daysSinceFirstSession <= 0 || totalSessions <= 0) {
    return "poor"; // No data or invalid data
  }

  const averageFrequency = totalSessions / daysSinceFirstSession;

  // Thresholds based on average sessions per day (approximating the 14-day logic)
  if (averageFrequency >= 0.7) return "very_good"; // ~10 sessions in 14 days
  if (averageFrequency >= 0.5) return "good"; // ~7 sessions in 14 days
  if (averageFrequency >= 0.28) return "average"; // ~4 sessions in 14 days
  return "poor";
}

/**
 * Retrieves and aggregates data for the user dashboard.
 *
 * This action fetches data for the currently authenticated user and aggregates it
 * to provide a summary for the dashboard widgets.
 *
 * @returns A promise that resolves to the UserDashboardDataOutput object.
 * @throws {Error} If the user is not authenticated or if a database error occurs.
 */
export async function getUserDashboardData(): Promise<UserDashboardDataOutput> {
  const supabase = await supabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }
  const userId = user.id;

  const { data, error: sessionsError } = await supabase
    .from("training_sessions")
    .select(
      `
      id,
      completed_at,
      duration_seconds,
      plan_id,
      training_plans ( name )
    `
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (sessionsError) {
    throw new Error(`Database error: ${sessionsError.message}`);
  }

  const sessionsData = data as SessionWithPlanName[] | null;

  if (!sessionsData || sessionsData.length === 0) {
    return {
      hasTrainingData: false,
      lastSession: null,
      weeklyProgress: { completed_count: 0, goal: 5 },
      systematicsScore: {
        total_sessions: 0,
        days_since_first_session: 0,
        score: "poor",
      },
      trainingSummary: {
        completed_this_week: 0,
        total_duration_seconds: 0,
        longest_duration_seconds: 0,
        average_duration_seconds: 0,
      },
      charts: { durationTrend: [], workoutsByPlan: [] },
    };
  }

  const hasTrainingData = true;
  const latestSession = sessionsData[0];
  let earliestSessionDate = dayjs(latestSession.completed_at);

  const lastSession: UserDashboardDataOutput["lastSession"] = {
    plan_id: latestSession.plan_id,
    plan_name: latestSession.training_plans?.name ?? "Unknown Plan",
    completed_at: latestSession.completed_at,
    duration_seconds: latestSession.duration_seconds,
  };

  const now = dayjs();
  const startOfCurrentWeek = now.startOf("isoWeek"); // Monday
  const endOfCurrentWeek = now.endOf("isoWeek"); // Sunday

  let completedThisWeekCount = 0;
  let totalDurationSeconds = 0;
  let longestDurationSeconds = 0;
  const durationTrendData: UserDashboardDataOutput["charts"]["durationTrend"] =
    [];
  const workoutsByPlanMap = new Map<string, number>();

  for (const session of sessionsData) {
    const completedAtDate = dayjs(session.completed_at);

    if (completedAtDate.isSameOrBefore(earliestSessionDate)) {
      earliestSessionDate = completedAtDate;
    }

    if (
      completedAtDate.isBetween(
        startOfCurrentWeek,
        endOfCurrentWeek,
        null,
        "[]"
      )
    ) {
      completedThisWeekCount++;
    }

    totalDurationSeconds += session.duration_seconds;

    if (session.duration_seconds > longestDurationSeconds) {
      longestDurationSeconds = session.duration_seconds;
    }

    durationTrendData.push({
      date: completedAtDate.format("YYYY-MM-DD"),
      duration_seconds: session.duration_seconds,
    });

    const planName = session.training_plans?.name ?? "Unknown Plan";
    workoutsByPlanMap.set(planName, (workoutsByPlanMap.get(planName) ?? 0) + 1);
  }

  const averageDurationSeconds =
    sessionsData.length > 0
      ? Math.round(totalDurationSeconds / sessionsData.length)
      : 0;

  const systematicsScoreValue = getSystematicsScore(
    sessionsData.length,
    dayjs().diff(earliestSessionDate, "day") + 1
  );

  const workoutsByPlanArray = Array.from(workoutsByPlanMap.entries()).map(
    ([plan_name, count]) => ({ plan_name, count })
  );

  durationTrendData.reverse();

  const daysSinceFirstSession = dayjs().diff(earliestSessionDate, "day") + 1;
  const totalSessionsCount = sessionsData.length;

  const result: UserDashboardDataOutput = {
    hasTrainingData,
    lastSession,
    weeklyProgress: {
      completed_count: completedThisWeekCount,
      goal: 5,
    },
    systematicsScore: {
      total_sessions: totalSessionsCount,
      days_since_first_session: daysSinceFirstSession,
      score: systematicsScoreValue,
    },
    trainingSummary: {
      completed_this_week: completedThisWeekCount,
      total_duration_seconds: totalDurationSeconds,
      longest_duration_seconds: longestDurationSeconds,
      average_duration_seconds: averageDurationSeconds,
    },
    charts: {
      durationTrend: durationTrendData,
      workoutsByPlan: workoutsByPlanArray,
    },
  };

  return result;
}

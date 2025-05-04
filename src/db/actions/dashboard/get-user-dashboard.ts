import { supabaseClient } from "@/db/supabase.server";
import type { UserDashboardDataOutput } from "@/types";
import type { Tables } from "@/db/database.types";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);

type SessionWithPlanName = Tables<"training_sessions"> & {
  training_plans: { name: string } | null;
};

function getSystematicsScore(
  sessionsLast14Days: number
): UserDashboardDataOutput["systematicsScore"]["score"] {
  if (sessionsLast14Days >= 10) return "very_good";
  if (sessionsLast14Days >= 7) return "good";
  if (sessionsLast14Days >= 4) return "average";
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
      systematicsScore: { sessions_last_14_days: 0, score: "poor" },
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
  const lastSession: UserDashboardDataOutput["lastSession"] = {
    plan_name: latestSession.training_plans?.name ?? "Unknown Plan",
    completed_at: latestSession.completed_at,
    duration_seconds: latestSession.duration_seconds,
  };

  const now = dayjs();
  const startOfCurrentWeek = now.startOf("isoWeek"); // Monday
  const endOfCurrentWeek = now.endOf("isoWeek"); // Sunday
  const fourteenDaysAgo = now.subtract(14, "days").startOf("day");

  let completedThisWeekCount = 0;
  let sessionsLast14DaysCount = 0;
  let totalDurationSeconds = 0;
  let longestDurationSeconds = 0;
  const durationTrendData: UserDashboardDataOutput["charts"]["durationTrend"] =
    [];
  const workoutsByPlanMap = new Map<string, number>();

  for (const session of sessionsData) {
    const completedAtDate = dayjs(session.completed_at);

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

    if (completedAtDate.isSameOrAfter(fourteenDaysAgo)) {
      sessionsLast14DaysCount++;
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

  const systematicsScoreValue = getSystematicsScore(sessionsLast14DaysCount);

  const workoutsByPlanArray = Array.from(workoutsByPlanMap.entries()).map(
    ([plan_name, count]) => ({ plan_name, count })
  );

  durationTrendData.reverse();

  const result: UserDashboardDataOutput = {
    hasTrainingData,
    lastSession,
    weeklyProgress: {
      completed_count: completedThisWeekCount,
      goal: 5,
    },
    systematicsScore: {
      sessions_last_14_days: sessionsLast14DaysCount,
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

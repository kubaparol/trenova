import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";
import { ProjectUrls } from "@/constants";
import { getUserDashboardData } from "@/db/actions/dashboard/get-user-dashboard";
import { LastSessionCard } from "../modules/dashboard/LastSessionCard";
import { WeeklyProgressCard } from "../modules/dashboard/WeeklyProgressCard";
import { SystematicsScoreCard } from "../modules/dashboard/SystematicsScoreCard";
import { TrainingSummaryCard } from "../modules/dashboard/TrainingSummaryCard";
import { DurationTrendChart } from "../modules/dashboard/DurationTrendChart";
import { WorkoutsByPlanChart } from "../modules/dashboard/WorkoutsByPlanChart";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function DashboardView() {
  return (
    <Suspense fallback={<DashboardViewSkeleton />}>
      <DashboardViewLoader />
    </Suspense>
  );
}

async function DashboardViewLoader() {
  const data = await getUserDashboardData();

  const isEmpty =
    !data || (!data.lastSession && !data.weeklyProgress.completed_count);

  return (
    <div className="space-y-6 relative">
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/60 rounded-lg h-full z-10">
          <DashboardViewEmptyState />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LastSessionCard lastSession={data?.lastSession} />
        <WeeklyProgressCard
          completed={data?.weeklyProgress.completed_count || 0}
          goal={data?.weeklyProgress.goal || 0}
        />
        <SystematicsScoreCard
          totalSessions={2}
          daysSinceFirstSession={
            data?.systematicsScore.days_since_first_session || 0
          }
          score={data?.systematicsScore.score || "poor"}
        />
      </div>

      <TrainingSummaryCard
        completedThisWeek={data?.trainingSummary.completed_this_week || 0}
        totalDurationSeconds={data?.trainingSummary.total_duration_seconds || 0}
        longestDurationSeconds={
          data?.trainingSummary.longest_duration_seconds || 0
        }
        averageDurationSeconds={
          data?.trainingSummary.average_duration_seconds || 0
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DurationTrendChart data={data?.charts.durationTrend || []} />
        <WorkoutsByPlanChart data={data?.charts.workoutsByPlan || []} />
      </div>
    </div>
  );
}

function DashboardViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardViewEmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="w-full max-w-md shadow-xl border-muted/30 bg-background/80 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">
            No Workouts Logged Yet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-muted-foreground">
            Start your fitness journey today! Log your first workout to begin
            tracking progress and viewing insights.
          </p>
          <p className="text-sm text-muted-foreground">
            Your dashboard will update automatically as you add new sessions.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center mt-4">
          <Button asChild>
            <Link
              href={ProjectUrls.trainingPlans}
              className="flex items-center gap-2"
            >
              <span>Browse Training Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

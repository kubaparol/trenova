import { headers } from "next/headers";
import { userAgent } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTrainingSessions } from "@/db/actions/training-sessions/get-sessions";
import { Button } from "../ui/button";
import Link from "next/link";
import { ProjectUrls } from "@/constants";
import { Dumbbell } from "lucide-react";
import { formatDuration } from "@/utils";
import dayjs from "dayjs";

export function TrainingHistoryView() {
  return (
    <Suspense fallback={<TrainingHistoryViewSkeleton />}>
      <TrainingHistoryViewLoader />
    </Suspense>
  );
}

async function TrainingHistoryViewLoader() {
  const sessions = await getTrainingSessions();

  const headersList = await headers();

  const { device } = userAgent({ headers: headersList });
  const isMobile = device?.type === "mobile";

  if (sessions.total === 0) {
    return <TrainingHistoryViewEmptyState />;
  }

  return (
    <div className="space-y-6">
      {isMobile ? (
        <div className="space-y-4">
          {sessions.items.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 hover:bg-muted/10 transition-colors"
            >
              <h3 className="font-medium">{session.plan_day_name}</h3>
              <p className="text-sm text-muted-foreground">
                {dayjs(session.completed_at).format("MMM D, YYYY")}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm">
                  Duration: {formatDuration(session.duration_seconds)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.items.map((session) => (
                <TableRow
                  key={session.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="font-medium">
                    {session.plan_name}
                  </TableCell>
                  <TableCell>{session.plan_day_name}</TableCell>
                  <TableCell className="font-medium">
                    {dayjs(session.completed_at).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell>
                    {formatDuration(session.duration_seconds)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

async function TrainingHistoryViewSkeleton() {
  const headersList = await headers();

  const { device } = userAgent({ headers: headersList });
  const isMobile = device?.type === "mobile";

  return (
    <div className="space-y-6">
      {isMobile ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
}

function TrainingHistoryViewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Dumbbell size={40} className="text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold mb-2">
        You haven&apos;t completed any training sessions yet
      </h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        Ready to start working out? Check out your training plans!
      </p>

      <Button asChild size="lg">
        <Link href={ProjectUrls.createTrainingPlan}>
          Create your first plan
        </Link>
      </Button>
    </div>
  );
}

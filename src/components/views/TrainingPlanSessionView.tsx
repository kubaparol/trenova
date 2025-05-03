import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getTrainingPlanById } from "@/db/actions/training-plans/get-by-id";
import { TrainingSession } from "../modules/training-plans/TrainingSession";
import { completeTrainingSession } from "@/db/actions/training-sessions/complete";

interface TrainingPlanSessionViewProps {
  id: string;
  dayName: string;
}

export function TrainingPlanSessionView(props: TrainingPlanSessionViewProps) {
  return (
    <Suspense fallback={<TrainingPlanSessionViewSkeleton />}>
      <TrainingPlanSessionViewLoader id={props.id} dayName={props.dayName} />
    </Suspense>
  );
}

async function TrainingPlanSessionViewLoader(
  props: TrainingPlanSessionViewProps
) {
  const { id, dayName } = props;

  const trainingPlan = await getTrainingPlanById({ id });

  const handleCompleteSession = async (duration_seconds: number) => {
    "use server";

    await completeTrainingSession({
      plan_id: id,
      plan_day_name: dayName,
      duration_seconds,
    });
  };

  const currentDay = trainingPlan.plan_details.days.find(
    (day) => day.day === dayName
  );

  if (!currentDay) {
    return <div>Day not found</div>;
  }

  return (
    <TrainingSession
      id={id}
      exercises={currentDay.exercises}
      dayName={currentDay.day}
      onCompleteSession={handleCompleteSession}
    />
  );
}

function TrainingPlanSessionViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

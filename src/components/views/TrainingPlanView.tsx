import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getTrainingPlanById } from "@/db/actions/training-plans/get-by-id";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Exercise, PlanDay } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import {
  TrainingPlanNameFormValues,
  UpdateTrainingPlanNameForm,
} from "../forms/UpdateTrainingPlanNameForm";
import { updateTrainingPlanName } from "@/db/actions/training-plans/update-name";

interface TrainingPlanViewProps {
  id: string;
}

export function TrainingPlanView(props: TrainingPlanViewProps) {
  return (
    <Suspense fallback={<TrainingPlanViewSkeleton />}>
      <TrainingPlanViewLoader id={props.id} />
    </Suspense>
  );
}

async function TrainingPlanViewLoader(props: TrainingPlanViewProps) {
  const { id } = props;

  const trainingPlan = await getTrainingPlanById({ id });

  const handleUpdateTrainingPlanName = async (
    id: string,
    values: TrainingPlanNameFormValues
  ) => {
    "use server";

    await updateTrainingPlanName({ id, name: values.name });
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {trainingPlan.name}
          </h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Pencil className="h-4 w-4" />
                <span>Chande Name</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Zmień nazwę planu</DialogTitle>
                <DialogDescription>
                  Wprowadź nową nazwę dla swojego planu treningowego.
                </DialogDescription>
              </DialogHeader>

              <UpdateTrainingPlanNameForm
                trainingPlanId={id}
                defaultValues={{ name: trainingPlan.name }}
                onSubmit={handleUpdateTrainingPlanName}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Placeholder for future action buttons */}
        <div className="h-8 mt-2">
          {/* Action buttons like "Rename" or "Delete" would go here */}
        </div>
      </div>

      <>
        {trainingPlan.plan_details.days.length === 0 ? (
          <p className="text-gray-500 italic">
            No training days defined for this plan.
          </p>
        ) : (
          <PlanDaysAccordion days={trainingPlan.plan_details.days} />
        )}
      </>
    </>
  );
}

function TrainingPlanViewSkeleton() {
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

const PlanDaysAccordion = ({ days }: { days: PlanDay[] }) => {
  if (days.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No training days defined for this plan.
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {days.map((day, index) => (
        <AccordionItem key={index} value={`day-${index}`}>
          <AccordionTrigger className="text-left font-medium">
            {day.day}
          </AccordionTrigger>
          <AccordionContent>
            <DayWorkout exercises={day.exercises} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const DayWorkout = ({ exercises }: { exercises: Exercise[] }) => {
  return <ExerciseList exercises={exercises} />;
};

const ExerciseList = ({ exercises }: { exercises: Exercise[] }) => {
  if (exercises.length === 0) {
    return (
      <p className="text-gray-500 italic">No exercises defined for this day.</p>
    );
  }

  return (
    <ul className="space-y-1">
      {exercises.map((exercise, index) => (
        <ExerciseListItem key={index} exercise={exercise} />
      ))}
    </ul>
  );
};

const ExerciseListItem = ({ exercise }: { exercise: Exercise }) => {
  // Format duration if present
  const formatDuration = () => {
    if (exercise.duration_minutes || exercise.duration_seconds) {
      const minutes = exercise.duration_minutes
        ? `${exercise.duration_minutes}m`
        : "";
      const seconds = exercise.duration_seconds
        ? `${exercise.duration_seconds}s`
        : "";
      return `Duration: ${minutes} ${seconds}`.trim();
    }
    return `Reps: ${exercise.repetitions}`;
  };

  return (
    <li className="py-3 border-b last:border-0 border-gray-100">
      <div className="font-medium text-base">{exercise.name}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-sm text-gray-600">
        <div>Sets: {exercise.sets}</div>
        <div>{formatDuration()}</div>
        <div>Rest: {exercise.rest_time_seconds}s</div>
      </div>
    </li>
  );
};

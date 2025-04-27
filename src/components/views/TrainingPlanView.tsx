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
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <PlanHeader name={trainingPlan.name} />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Pencil className="h-4 w-4" />
                <span>Change Name</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Plan Name</DialogTitle>
                <DialogDescription>
                  Enter a new name for your training plan.
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

        <PlanDescription description={trainingPlan.description} />
      </CardHeader>

      <CardContent>
        <PlanDaysAccordion days={trainingPlan.plan_details.days} />
      </CardContent>
    </Card>
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
  if (!days || days.length === 0) {
    return (
      <p className="text-muted-foreground italic">
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
            <ExerciseList exercises={day.exercises} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const PlanHeader = ({ name }: { name: string }) => {
  return (
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
      {name}
    </h1>
  );
};

const PlanDescription = ({ description }: { description: string }) => {
  return <p className="text-muted-foreground mb-6">{description}</p>;
};

const ExerciseList = ({ exercises }: { exercises: Exercise[] }) => {
  if (!exercises || exercises.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        No exercises scheduled for this day.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {exercises.map((exercise, index) => (
        <ExerciseListItem key={index} exercise={exercise} />
      ))}
    </ul>
  );
};

const ExerciseListItem = ({ exercise }: { exercise: Exercise }) => {
  // Format duration or repetitions
  const formatWorkload = () => {
    if (exercise.duration_minutes || exercise.duration_seconds) {
      const minutes = exercise.duration_minutes
        ? `${exercise.duration_minutes}m`
        : "";
      const seconds = exercise.duration_seconds
        ? `${exercise.duration_seconds}s`
        : "";
      return `${minutes} ${seconds}`.trim();
    }
    return `${exercise.repetitions} reps`;
  };

  return (
    <li className="py-3 border-b last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="font-medium">{exercise.name}</span>
        <div className="text-sm text-muted-foreground">
          {exercise.sets} sets × {formatWorkload()},{" "}
          {exercise.rest_time_seconds}s rest
        </div>
      </div>
    </li>
  );
};

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getTrainingPlanById } from "@/db/actions/training-plans/get-by-id";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlanDay } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Pencil, PlayCircle } from "lucide-react";
import {
  TrainingPlanNameFormValues,
  UpdateTrainingPlanNameForm,
} from "../forms/UpdateTrainingPlanNameForm";
import { updateTrainingPlanName } from "@/db/actions/training-plans/update-name";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ProjectUrls } from "@/constants";
import { getTrainingSessions } from "@/db/actions/training-sessions/get-sessions";
import { formatDuration } from "@/utils";
import dayjs from "dayjs";

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

  const [trainingPlan, sessions] = await Promise.all([
    getTrainingPlanById({ id }),
    getTrainingSessions({ plan_id: id }),
  ]);

  const handleUpdateTrainingPlanName = async (
    id: string,
    values: TrainingPlanNameFormValues
  ) => {
    "use server";

    await updateTrainingPlanName({ id, name: values.name });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">
            {trainingPlan.name}
          </h1>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  <span>Rename Plan</span>
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
        </div>
      </div>

      {/* Plan Description Section */}
      <p className="text-muted-foreground">{trainingPlan.description}</p>

      {/* Training Days Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Training Days</h2>

        <Accordion
          type="single"
          collapsible
          defaultValue="day-0"
          className="w-full space-y-4"
        >
          {trainingPlan.plan_details.days
            .filter((day) => day.exercises.length > 0)
            .map((day, index) => (
              <AccordionItem
                key={index}
                value={`day-${index}`}
                className="border-b-0"
              >
                <Card className="py-0">
                  <AccordionTrigger className="px-6">
                    {day.day}
                  </AccordionTrigger>

                  <AccordionContent>
                    <TrainingDayCard id={id} day={day} />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
        </Accordion>
      </div>

      {/* Session History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Session History</h2>

        <div className="divide-y">
          {sessions.items.length > 0 ? (
            sessions.items.map((session, index) => (
              <Card key={index} className="py-4 my-4">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{session.plan_day_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dayjs(session.completed_at).format("DD/MM/YYYY")}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      Duration: {formatDuration(session.duration_seconds)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No session history recorded for this plan yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrainingDayCard({ id, day }: { id: string; day: PlanDay }) {
  return (
    <CardContent className="space-y-5">
      <div className="space-y-3">
        {day.exercises.map((exercise, index) => {
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
            <div key={index} className="bg-muted/50 p-3 rounded-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-medium">{exercise.name}</h3>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-400/10 text-blue-600 dark:bg-blue-300/20 dark:text-blue-300"
                  >
                    {exercise.sets ? `${exercise.sets} sets` : "1 set"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-green-400/10 text-green-600 dark:bg-green-300/20 dark:text-green-300"
                  >
                    {formatWorkload()}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-purple-400/10 text-purple-600 dark:bg-purple-300/20 dark:text-purple-300"
                  >
                    {exercise.rest_time_seconds}s rest
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button asChild className="gap-2" size="sm">
          <Link href={`${ProjectUrls.trainingPlanSession(id)}?day=${day.day}`}>
            <PlayCircle className="h-4 w-4" />
            <span>Start Session</span>
          </Link>
        </Button>
      </div>
    </CardContent>
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

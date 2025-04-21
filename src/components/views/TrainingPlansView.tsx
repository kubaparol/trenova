import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { ArrowRight, Trash2, Users } from "lucide-react";
import { getUserTrainingPlans } from "@/db/actions/training-plans/get-user-plans";
import dayjs from "dayjs";
import Link from "next/link";
import { ProjectUrls } from "@/constants";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeleteTrainingPlanForm } from "../forms/DeleteTrainingPlanForm";
import { deleteTrainingPlan } from "@/db/actions/training-plans/delete";

export function TrainingPlansView() {
  return (
    <Suspense fallback={<TrainingPlansViewSkeleton />}>
      <TrainingPlansViewLoader />
    </Suspense>
  );
}

async function TrainingPlansViewLoader() {
  const trainingPlans = await getUserTrainingPlans();

  if (trainingPlans.total === 0) {
    return <TrainingPlansViewEmptyState />;
  }

  const handleDeleteTrainingPlan = async (id: string) => {
    "use server";

    await deleteTrainingPlan({ id });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainingPlans.items.map((plan) => (
        <Card key={plan.id} className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="line-clamp-2">{plan.name}</CardTitle>
            <CardDescription>
              {dayjs(plan.created_at).format("MMM D, YYYY")}
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex gap-2 pt-2">
            <Link href={ProjectUrls.trainingPlan(plan.id)} className="flex-1">
              <Button variant="default" className="w-full group">
                View Details
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-shrink-0">
                  <span className="sr-only">Delete</span>
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your training plan and remove all associated data from our
                    servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <DeleteTrainingPlanForm
                  trainingPlanId={plan.id}
                  onSubmit={handleDeleteTrainingPlan}
                />
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TrainingPlansViewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="h-full flex flex-col">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex-grow">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TrainingPlansViewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Users size={40} className="text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold mb-2">
        You don&apos;t have any training plans yet
      </h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first training plan to start tracking your workouts and
        progress
      </p>

      <Button asChild size="lg">
        <Link href={ProjectUrls.createTrainingPlan}>
          Create your first plan
        </Link>
      </Button>
    </div>
  );
}

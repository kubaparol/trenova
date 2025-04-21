"use client";

import { useTransition } from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteTrainingPlanFormProps {
  trainingPlanId: string;
  onSubmit: (id: string) => Promise<void>;
}

export function DeleteTrainingPlanForm({
  trainingPlanId,
  onSubmit,
}: DeleteTrainingPlanFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await onSubmit(trainingPlanId);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

        <AlertDialogAction asChild>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </form>
  );
}

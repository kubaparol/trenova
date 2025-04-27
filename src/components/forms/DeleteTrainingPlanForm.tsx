"use client";

import { useTransition } from "react";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      try {
        await onSubmit(trainingPlanId);
        toast.success("Training plan deleted successfully.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting the plan.";
        toast.error("Deletion failed", { description: message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}

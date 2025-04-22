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
      await onSubmit(trainingPlanId);
    });

    toast.success("Success", {
      description: "Training plan deleted successfully.",
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

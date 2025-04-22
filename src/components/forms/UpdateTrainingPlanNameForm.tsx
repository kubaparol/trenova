"use client";

import { useTransition, useRef } from "react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const trainingPlanNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nazwa planu musi mieć co najmniej 3 znaki" })
    .max(50, { message: "Nazwa planu nie może przekraczać 50 znaków" }),
});

export type TrainingPlanNameFormValues = z.infer<typeof trainingPlanNameSchema>;

interface UpdateTrainingPlanNameFormProps {
  trainingPlanId: string;
  defaultValues?: TrainingPlanNameFormValues;
  onSubmit: (id: string, values: TrainingPlanNameFormValues) => Promise<void>;
}

export function UpdateTrainingPlanNameForm({
  trainingPlanId,
  defaultValues,
  onSubmit,
}: UpdateTrainingPlanNameFormProps) {
  const [isPending, startTransition] = useTransition();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<TrainingPlanNameFormValues>({
    resolver: zodResolver(trainingPlanNameSchema),
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onSubmit(trainingPlanId, form.getValues());

        toast.success("Success", {
          description: "Nazwa planu zaktualizowana pomyślnie.",
        });

        if (closeButtonRef.current) {
          closeButtonRef.current.click();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";

        toast.error("Error", {
          description: message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <DialogClose ref={closeButtonRef} className="hidden" type="button" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa Planu</FormLabel>

              <FormControl>
                <Input placeholder="Mój plan treningowy" {...field} />
              </FormControl>

              <FormDescription>
                Nadaj swojemu planowi unikalną nazwę.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

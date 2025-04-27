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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CONFIRMATION_TEXT = "DELETE ACCOUNT";

const deleteAccountSchema = z.object({
  confirmationInput: z.string(),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountFormProps {
  onSubmit: (values: DeleteAccountFormValues) => Promise<void>;
}

export function DeleteAccountForm({ onSubmit }: DeleteAccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmationInput: undefined,
    },
  });

  const handleSubmit = (values: DeleteAccountFormValues) => {
    startTransition(async () => {
      try {
        await onSubmit(values);

        toast.success("Success", {
          description: "Your account has been deleted successfully.",
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

  const isConfirmButtonEnabled =
    form.watch("confirmationInput") === CONFIRMATION_TEXT;

  return (
    <Form {...form}>
      <DialogClose ref={closeButtonRef} className="hidden" type="button" />

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="confirmationInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                To confirm, type &quot;{CONFIRMATION_TEXT}&quot; in the field
                below:
              </FormLabel>

              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            disabled={isPending || !isConfirmButtonEnabled}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

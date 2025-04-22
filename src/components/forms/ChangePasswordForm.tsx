"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Aktualne hasło jest wymagane"),
    newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków"),
    confirmNewPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Nowe hasło musi być różne od aktualnego",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
}

export default function ChangePasswordForm({
  onSubmit,
}: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Function to handle submission when form is valid
  const handleValidSubmit = async (values: ChangePasswordFormValues) => {
    startTransition(async () => {
      try {
        await onSubmit(values);

        toast.success("Sukces", {
          description: "Hasło zostało pomyślnie zmienione.",
        });

        form.reset();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Wystąpił nieoczekiwany błąd podczas zmiany hasła.";

        toast.error("Błąd", { description: message });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValidSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktualne hasło</FormLabel>

              <FormControl>
                <Input
                  type="password"
                  placeholder="Wprowadź aktualne hasło"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nowe hasło</FormLabel>

              <FormControl>
                <Input
                  type="password"
                  placeholder="Wprowadź nowe hasło"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź nowe hasło</FormLabel>

              <FormControl>
                <Input
                  type="password"
                  placeholder="Potwierdź nowe hasło"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            "Zmień hasło"
          )}
        </Button>
      </form>
    </Form>
  );
}

"use client";

import { z } from "zod";
import { AuthForm } from "../forms/AuthForm";
import Link from "next/link";
import { ProjectUrls } from "@/constants";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/db/actions/auth/reset-password";
import { toast } from "sonner";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordView() {
  const router = useRouter();

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    const result = await resetPassword(data);

    if (!result.success) {
      toast.error("Password Reset Failed", {
        description: result.message,
      });
      return;
    }

    router.push(ProjectUrls.resetPasswordSuccess);
  };

  return (
    <AuthForm<ResetPasswordFormData>
      title="Reset Password"
      description="Reset your password below"
      schema={resetPasswordFormSchema}
      onSubmit={handleResetPassword}
      submitText="Reset Password"
      submittingText="Resetting password..."
      fields={[
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          placeholder: "Confirm your password",
        },
      ]}
      footer={
        <p className="text-sm">
          Back to{" "}
          <Link
            href={ProjectUrls.signIn}
            className="underline underline-offset-4 text-primary"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}

"use client";

import { z } from "zod";
import { AuthForm } from "../forms/AuthForm";
import Link from "next/link";
import { ProjectUrls } from "@/constants";

const forgotPasswordFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordView() {
  const handleForgotPassword = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  return (
    <AuthForm<ForgotPasswordFormData>
      title="Forgot Password"
      description="Forgot your password? Enter your email address below, and we'll send you a link to reset your password."
      schema={forgotPasswordFormSchema}
      onSubmit={handleForgotPassword}
      submitText="Send Reset Link"
      submittingText="Sending reset link..."
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
      ]}
      footer={
        <p className="text-sm">
          Back to{" "}
          <Link
            href={ProjectUrls.signIn}
            className="underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}

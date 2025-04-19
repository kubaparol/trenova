"use client";

import { z } from "zod";
import { AuthForm } from "../forms/AuthForm";
import Link from "next/link";
import { ProjectUrls } from "@/constants";

const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

export function SignInView() {
  const handleSignIn = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  return (
    <AuthForm<SignInFormData>
      title="Sign In"
      description="Sign in to your account to get started"
      schema={signInFormSchema}
      onSubmit={handleSignIn}
      submitText="Sign In"
      submittingText="Signing in..."
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Create a password",
        },
      ]}
      footer={
        <div className="text-sm text-center space-y-2">
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href={ProjectUrls.signUp}
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>

          <Link href="/login" className="underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
      }
    />
  );
}

"use client";

import { z } from "zod";
import { AuthForm } from "../forms/AuthForm";
import Link from "next/link";

const signUpFormSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function SignUpView() {
  const handleSignUp = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  return (
    <AuthForm<SignUpFormData>
      title="Create Account"
      description="Sign up for a new account to get started"
      schema={signUpFormSchema}
      onSubmit={handleSignUp}
      submitText="Sign Up"
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
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          placeholder: "Confirm your password",
        },
      ]}
      footer={
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    />
  );
}

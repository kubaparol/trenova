"use client";

import { z } from "zod";
import { AuthForm } from "../forms/AuthForm";
import Link from "next/link";
import { ProjectUrls } from "@/constants";
import { signUp } from "@/db/actions/auth/sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function SignUpView() {
  const router = useRouter();

  const handleSignUp = async (data: SignUpFormData) => {
    const result = await signUp(data);

    if (!result.success) {
      toast.error("Error", {
        description: result.message,
      });
      return;
    }

    router.push(ProjectUrls.signUpSuccess);
  };

  return (
    <AuthForm<SignUpFormData>
      title="Create Account"
      description="Sign up for a new account to get started"
      schema={signUpFormSchema}
      onSubmit={handleSignUp}
      submitText="Sign Up"
      submittingText="Signing up..."
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

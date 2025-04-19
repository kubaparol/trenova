"use server";

import { z } from "zod";
import { supabaseClient } from "../../supabase.server";
import { redirect } from "next/navigation";
import { SignInFormData } from "@/components/views/SignInView";

export async function signIn(data: SignInFormData) {
  try {
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    redirect("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Invalid form data",
      };
    }

    return {
      error: "An unexpected error occurred",
    };
  }
}

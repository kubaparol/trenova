"use server";

import { supabaseClient } from "@/db/supabase.server";
import { ServerActionResponse, SignUpInput } from "@/types";

export async function signUp(
  input: SignUpInput
): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Signed up successfully",
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while signing up",
    };
  }
}

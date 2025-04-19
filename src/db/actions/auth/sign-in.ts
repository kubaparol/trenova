"use server";

import { supabaseClient } from "../../supabase.server";
import { ServerActionResponse, SignInInput } from "@/types";

export async function signIn(
  input: SignInInput
): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while signing in",
    };
  }
}

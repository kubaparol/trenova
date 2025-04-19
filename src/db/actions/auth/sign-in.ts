"use server";

import { supabaseClient } from "../../supabase.server";
import { SignInFormData } from "@/components/views/SignInView";
import { ServerActionResponse } from "@/types";

export async function signIn(
  data: SignInFormData
): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
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

"use server";

import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { ServerActionResponse, SignUpInput } from "@/types";
import { headers } from "next/headers";

export async function signUp(
  input: SignUpInput
): Promise<ServerActionResponse> {
  try {
    const origin = (await headers()).get("origin");
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${origin}/auth-callback?redirect_to=${ProjectUrls.signUpSuccess}`,
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

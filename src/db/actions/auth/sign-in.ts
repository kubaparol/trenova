"use server";

import { supabaseClient } from "../../supabase.server";
import { SignInFormData } from "@/components/views/SignInView";
import { ServerActionResponse } from "@/types";

export async function signIn(
  data: SignInFormData
): Promise<ServerActionResponse> {
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
  };
}

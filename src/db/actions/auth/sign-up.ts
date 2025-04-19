"use server";

import { supabaseClient } from "@/db/supabase.server";
import { SignUpFormData } from "@/components/views/SignUpView";
import { ServerActionResponse } from "@/types";

export async function signUp(
  data: SignUpFormData
): Promise<ServerActionResponse> {
  const supabase = await supabaseClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
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
  };
}

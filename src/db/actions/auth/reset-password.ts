"use server";

import { supabaseClient } from "@/db/supabase.server";
import { ServerActionResponse } from "@/types/index";
import { ResetPasswordFormData } from "@/components/views/ResetPasswordView";

export async function resetPassword(
  data: ResetPasswordFormData
): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.updateUser({
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
      message: "Password updated successfully",
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while resetting the password",
    };
  }
}

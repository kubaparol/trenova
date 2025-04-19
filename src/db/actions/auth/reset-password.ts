"use server";

import { supabaseClient } from "@/db/supabase.server";
import { ServerActionResponse } from "@/types/index";
import { ResetPasswordFormData } from "@/components/views/ResetPasswordView";

interface ResetPasswordData extends ResetPasswordFormData {
  token: string;
}

export async function resetPassword(
  data: ResetPasswordData
): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token,
      type: "recovery",
    });

    if (verifyError) {
      return {
        success: false,
        message: "Invalid or expired reset token",
      };
    }

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

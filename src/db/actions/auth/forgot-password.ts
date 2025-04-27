"use server";

import { supabaseClient } from "@/db/supabase.server";
import { ServerActionResponse } from "@/types";
import { ForgotPasswordFormData } from "@/components/views/ForgotPasswordView";
import { ProjectUrls } from "@/constants";
import { headers } from "next/headers";

export async function forgotPassword(
  data: ForgotPasswordFormData
): Promise<ServerActionResponse> {
  try {
    const origin = (await headers()).get("origin");
    const supabase = await supabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/auth-callback?redirect_to=${ProjectUrls.resetPassword}`,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while sending the reset password email",
    };
  }
}

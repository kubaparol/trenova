"use server";

import { supabaseClient } from "../../supabase.server";
import { ServerActionResponse } from "@/types";

export async function signOut(): Promise<ServerActionResponse> {
  try {
    const supabase = await supabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Signed out successfully",
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while signing out",
    };
  }
}

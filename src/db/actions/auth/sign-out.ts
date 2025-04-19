"use server";

import { supabaseClient } from "../../supabase.server";
import { ServerActionResponse } from "@/types";

export async function signOut(): Promise<ServerActionResponse> {
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
  };
}

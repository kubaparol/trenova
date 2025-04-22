"use server";

import { supabaseClient } from "@/db/supabase.server";
import type { ChangePasswordInput, ChangePasswordOutput } from "@/types";

/**
 * Changes the password for the currently authenticated user.
 * This function creates its own Supabase server client instance.
 * It assumes input validation (like password match and strength) happened on the client-side.
 * It checks if the new password is different from the current one.
 *
 * @param input - The input object containing currentPassword, newPassword, and confirmNewPassword.
 * @returns A promise that resolves to an object with a success message.
 * @throws {Error} Various errors depending on the failure:
 *                 - "Internal server error": If Supabase client creation fails.
 *                 - "Unauthorized": If the user is not authenticated.
 *                 - "Invalid input: New password cannot be the same as the current password": If new and current passwords match.
 *                 - "Incorrect current password": If the provided current password is wrong (detected by Supabase).
 *                 - "Failed to update password: ...": If the Supabase update operation fails for other reasons.
 */
export async function changePassword(
  input: ChangePasswordInput
): Promise<ChangePasswordOutput> {
  let supabase;
  try {
    supabase = await supabaseClient();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    // TODO: Implement proper logging
    throw new Error("Internal server error");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Step 1: Verify the current password by trying to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!, // Assert non-null as we checked user existence
    password: input.currentPassword,
  });

  if (signInError) {
    // Check if the error is specifically due to invalid credentials
    if (signInError.message.includes("Invalid login credentials")) {
      throw new Error("Incorrect current password");
    } else {
      // Log other sign-in errors and throw a generic failure message
      console.error(
        "Unexpected error during password verification:",
        signInError
      );
      throw new Error("Failed to verify current password.");
    }
  }

  // Custom validation: Ensure new password is not the same as the current one.
  // Other validations (match, strength) are expected to be done client-side.
  if (input.newPassword === input.currentPassword) {
    throw new Error(
      "Invalid input: New password cannot be the same as the current password"
    );
  }

  // Step 2: Update the user's password
  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  });

  // Step 3: Handle update errors
  if (updateError) {
    // Errors here are less likely to be "incorrect password" since we verified it,
    // but could be other issues (e.g., rate limits, server problems).
    console.error("Supabase password update error:", updateError);
    throw new Error(
      `Failed to update password: ${updateError.message || "Unknown error"}`
    );
  }

  // Step 4: Return success
  return { message: "Password changed successfully." };
}

import { supabaseAdmin } from "@/db/supabase.server";
import type { DeleteAccountOutput } from "@/types/api";
import { signOut } from "../auth/sign-out";

/**
 * Deletes the currently authenticated user's account and all associated data.
 * This action uses a server-side Supabase client with admin privileges.
 * It relies on 'ON DELETE CASCADE' constraints in the database for data removal.
 *
 * @returns A promise that resolves to an object indicating success.
 * @throws {Error("Unauthorized")} If the user is not authenticated.
 * @throws {Error("Server configuration error")} If the Supabase admin client cannot be initialized.
 * @throws {Error} If there's a database error during user deletion.
 */
export async function deleteAccount(): Promise<DeleteAccountOutput> {
  let supabase;
  try {
    supabase = await supabaseAdmin();
  } catch (configError) {
    console.error("Server configuration error:", configError);
    // Rethrow or handle as a specific server error type
    throw new Error("Server configuration error");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const userId = user.id;

  // Step 6 & 7: Call deleteUser and handle specific errors
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Database error deleting user:", deleteError);
    throw new Error(
      `Database error: Failed to delete user - ${deleteError.message}`
    );
  }

  await signOut();

  // Step 8: Return success
  return { message: "Account deleted successfully." };
}

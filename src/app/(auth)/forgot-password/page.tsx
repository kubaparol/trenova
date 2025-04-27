import { ForgotPasswordView } from "@/components/views/ForgotPasswordView";
import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function ForgotPasswordPage() {
  const supabase = await supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ProjectUrls.home);
  }

  return <ForgotPasswordView />;
}

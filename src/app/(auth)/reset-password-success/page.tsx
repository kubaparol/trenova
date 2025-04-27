import { ResetPasswordSuccessView } from "@/components/views/ResetPasswordSuccessView";
import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function ResetPasswordSuccessPage() {
  const supabase = await supabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ProjectUrls.home);
  }
  return <ResetPasswordSuccessView />;
}

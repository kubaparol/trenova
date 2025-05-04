import { SignUpVerifyView } from "@/components/views/SignUpVerifyView";
import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";

export default async function SignUpSuccessPage() {
  const supabase = await supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ProjectUrls.home);
  }

  return <SignUpVerifyView />;
}

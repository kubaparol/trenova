import { SignInView } from "@/components/views/SignInView";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";
import { ProjectUrls } from "@/constants";

export const runtime = "edge";

export default async function SignInPage() {
  const supabase = await supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ProjectUrls.home);
  }

  return <SignInView />;
}

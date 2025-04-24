import { ResetPasswordView } from "@/components/views/ResetPasswordView";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";
import { ProjectUrls } from "@/constants";
import { PageProps } from "@/types";

export const runtime = "edge";

export default async function ResetPasswordPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const supabase = await supabaseClient();
  const token = searchParams?.token as string;

  if (!token) {
    redirect(ProjectUrls.home);
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (error || !data.user) {
    redirect(ProjectUrls.home);
  }

  return <ResetPasswordView token={token} />;
}

import { ReactNode } from "react";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";
import { ProjectUrls } from "@/constants";
import { AuthLayout as AuthLayoutComponent } from "@/components/layouts/AuthLayout";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default async function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  const supabase = await supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ProjectUrls.home);
  }

  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}

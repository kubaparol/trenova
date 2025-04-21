import { AppLayout } from "@/components/layouts/AppLayout";
import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";

import { ReactNode } from "react";

interface AppRootLayoutProps {
  readonly children: ReactNode;
}

export default async function AppRootLayout(props: AppRootLayoutProps) {
  const { children } = props;

  const supabase = await supabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ProjectUrls.home);
  }

  return <AppLayout>{children}</AppLayout>;
}

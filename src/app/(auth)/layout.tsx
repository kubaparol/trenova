import { ReactNode } from "react";
import { supabaseClient } from "@/db/supabase.server";
import { redirect } from "next/navigation";
import { ProjectUrls } from "@/constants";

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

  return (
    <div className="container mx-auto flex flex-1 flex-col px-4 py-6 md:px-6 min-h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}

import { ReactNode } from "react";
import { HomeLayout } from "@/components/layouts/HomeLayout";
import { supabaseClient } from "@/db/supabase.server"; // Assuming this is the correct path

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  const supabase = await supabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomeLayout user={user}>{children}</HomeLayout>;
}

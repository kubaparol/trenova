import { ReactNode } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default async function AuthRootLayout(props: AuthLayoutProps) {
  const { children } = props;

  return <AuthLayout>{children}</AuthLayout>;
}

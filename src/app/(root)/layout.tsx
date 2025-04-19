import { ReactNode } from "react";

import HomeLayout from "@/components/layouts/HomeLayout";

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return <HomeLayout>{children}</HomeLayout>;
}

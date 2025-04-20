import { ReactNode } from "react";

interface AppRootLayoutProps {
  readonly children: ReactNode;
}

export default function AppRootLayout(props: AppRootLayoutProps) {
  const { children } = props;

  return <div>{children}</div>;
}

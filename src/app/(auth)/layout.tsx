import { ReactNode } from "react";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  return (
    <div className="container mx-auto flex flex-1 flex-col px-4 py-6 md:px-6 min-h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}

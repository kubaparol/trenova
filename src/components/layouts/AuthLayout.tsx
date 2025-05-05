import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "../shared/Logo";
import { ProjectUrls } from "@/constants";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-4 px-4 md:px-6 lg:px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={ProjectUrls.home} className="flex items-center">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-6 md:px-6 w-full items-center justify-center">
        {children}
      </main>
    </div>
  );
}

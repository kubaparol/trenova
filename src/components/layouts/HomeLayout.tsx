import type { ReactNode } from "react";
import Header from "@/components/layouts/components/Header";
import Footer from "@/components/layouts/components/Footer";
import { User } from "@supabase/supabase-js";

interface HomeLayoutProps {
  children: ReactNode;
  user: User | null;
}

export function HomeLayout({ children, user }: HomeLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

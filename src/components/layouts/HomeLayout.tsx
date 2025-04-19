import type { ReactNode } from "react";
import Header from "@/components/layouts/components/Header";
import Footer from "@/components/layouts/components/Footer";

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

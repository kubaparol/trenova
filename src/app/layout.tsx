import type { Metadata } from "next";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Trenova",
  description:
    "Trenova is an intelligent workout assistant that helps you to achieve your fitness goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <Toaster />
      </body>
    </html>
  );
}

"use client";

import { ReactNode } from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>

        <div className="flex-1 px-4 py-4 flex flex-col md:gap-6 md:py-6 lg:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

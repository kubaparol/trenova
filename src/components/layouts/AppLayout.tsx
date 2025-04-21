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
      <AppSidebar variant="floating" />

      <SidebarInset>
        <div className="flex-1 px-4 py-4 flex flex-col md:gap-6 md:py-6 lg:px-6">
          <SidebarTrigger />

          <div className="flex-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

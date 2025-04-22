"use client";

import Link from "next/link";
import * as React from "react";

import { useAppSidebarItems } from "@/hooks";

import { ProjectUrls } from "@/constants";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { PlusCircleIcon } from "lucide-react";
import Logo from "@/components/shared/Logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const items = useAppSidebarItems();

  const isActive = (url: string) => {
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 w-fit py-4 data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={ProjectUrls.home} className="flex items-center">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup {...props} className="h-full">
          <SidebarGroupContent className="space-y-6 flex flex-col h-full">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  asChild
                  tooltip="Create Training Plan"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <Link href={ProjectUrls.createTrainingPlan}>
                    <PlusCircleIcon />
                    <span>Create Training Plan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu className="flex-1 ">
              {items.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className={index === items.length - 1 ? "mt-auto" : ""}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url || "")}
                  >
                    {item.url ? (
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <Button onClick={item.onClick} variant="secondary">
                        <item.icon />
                        <span>{item.title}</span>
                      </Button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

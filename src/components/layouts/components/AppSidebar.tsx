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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const items = useAppSidebarItems();

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
                <span className="text-xl font-bold text-primary">Trenova</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup {...props} className=" h-full">
          <SidebarGroupContent className=" h-full">
            <SidebarMenu className="h-full">
              {items.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className={index === items.length - 1 ? "mt-auto" : ""}
                >
                  <SidebarMenuButton asChild>
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

"use client";

import { Fragment, ReactNode } from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { useParams, usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { pageMetadataMap } from "@/constants";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  const pathname = usePathname();
  const params = useParams();

  const routeTemplate = params.id
    ? pathname.replace(params.id as string, "[id]")
    : pathname;

  const pageMetadata =
    pageMetadataMap[routeTemplate as keyof typeof pageMetadataMap];

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />

            <Separator orientation="vertical" className="mr-2 !h-4" />

            {pageMetadata?.breadcrumbs.length > 0 && (
              <Breadcrumb className="text-sm">
                <BreadcrumbList>
                  {pageMetadata.breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={index}>
                      <BreadcrumbItem>
                        {breadcrumb.isCurrent ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={breadcrumb.href}>
                              {breadcrumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < pageMetadata.breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>

        <div className="flex-1 px-4 py-4 flex flex-col gap-6 md:py-6 lg:px-6">
          {(pageMetadata.title || pageMetadata.description) && (
            <header>
              {pageMetadata?.title && (
                <h1 className="text-2xl font-bold tracking-tight">
                  {pageMetadata.title}
                </h1>
              )}

              {pageMetadata?.description && (
                <p className="text-muted-foreground">
                  {pageMetadata.description}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

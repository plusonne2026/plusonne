"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { AdminAPI } from "../../lib/api/admin.api";
import { AdminAppSidebar } from "@/components/admin/app-sidebar";
import { AdminThemeToggle } from "@/components/admin/theme-toggle";
import { LayoutProvider } from "@/context/layout-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [pendingKycCount, setPendingKycCount] = useState<number>(0);

  const isLoginPage = pathname?.includes("/login");
  const isRootAdminPage = pathname === "/admin";

  useEffect(() => {
    if (!isLoginPage && !isRootAdminPage && !isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, isRootAdminPage, isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && !isLoginPage && !isRootAdminPage) {
      AdminAPI.getStats()
        .then((stats: any) => {
          if (stats && stats.pendingKycHosts !== undefined) {
            setPendingKycCount(stats.pendingKycHosts);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user, isLoginPage, isRootAdminPage]);

  if (isLoginPage || isRootAdminPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  const getPageBreadcrumb = () => {
    if (pathname?.includes("/dashboard")) {
      return { category: "Command Center", page: "Executive Overview" };
    }
    if (pathname?.includes("/hosts")) {
      return { category: "Verification & Hosts", page: "Host Directory & KYC Portal" };
    }
    if (pathname?.includes("/users")) {
      return { category: "Platform Community", page: "User Directory & Moderation" };
    }
    if (pathname?.includes("/settings")) {
      return { category: "System Architecture", page: "AWS DynamoDB Diagnostics" };
    }
    return { category: "PlusOnne Platform", page: "Admin Portal" };
  };

  const breadcrumbData = getPageBreadcrumb();

  return (
    <LayoutProvider>
      <SidebarProvider>
        <AdminAppSidebar />
        <SidebarInset className="bg-zinc-50 dark:bg-black min-h-screen text-zinc-900 dark:text-slate-100 flex flex-col font-outfit transition-colors">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl px-4 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <SidebarTrigger className="-ml-1 text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md size-9" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"
              />
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/admin/dashboard"
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      {breadcrumbData.category}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-zinc-400 dark:text-zinc-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs font-extrabold text-zinc-900 dark:text-white">
                      {breadcrumbData.page}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
              {pendingKycCount > 0 && (
                <Badge
                  onClick={() => router.push("/admin/hosts?filter=pending")}
                  className="bg-black dark:bg-zinc-900 text-white dark:text-white border border-black dark:border-zinc-700 px-2.5 py-1 text-[11px] font-black rounded-md cursor-pointer hover:bg-zinc-800 transition-all hidden lg:flex items-center gap-1.5 shadow-sm"
                >
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <span>{pendingKycCount} KYC Reviews Waiting</span>
                </Badge>
              )}

              <div className="relative hidden md:block w-64">
                <Search className="size-3.5 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                <Input
                  placeholder="Search across PlusOnne..."
                  className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 rounded-md pl-9 pr-4 text-xs text-zinc-900 dark:text-white h-9 w-full shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-extrabold">
                  <CheckCircle2 className="size-3 text-emerald-600 dark:text-white" />
                  <span>AWS ap-south-1 Live</span>
                </div>
                <button
                  onClick={() => router.push("/admin/hosts")}
                  className="relative p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="size-4" />
                  {pendingKycCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-[9px] flex items-center justify-center border-2 border-white dark:border-black">
                      {pendingKycCount}
                    </span>
                  )}
                </button>
                <AdminThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[98%] xl:max-w-[1920px] mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  );
}

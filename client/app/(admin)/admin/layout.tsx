"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { AdminAPI } from "../../lib/api/admin.api";
import { AdminAppSidebar } from "@/components/admin/app-sidebar";
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

  useEffect(() => {
    if (!isLoginPage && !isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [isLoginPage, isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && !isLoginPage) {
      AdminAPI.getStats()
        .then((stats: any) => {
          if (stats && stats.pendingKycHosts !== undefined) {
            setPendingKycCount(stats.pendingKycHosts);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
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
    <SidebarProvider>
      <AdminAppSidebar />
      <SidebarInset className="bg-[#07090E] min-h-screen text-slate-100 flex flex-col font-outfit">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-white/[0.08] bg-[#0D111A]/80 backdrop-blur-xl px-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <SidebarTrigger className="-ml-1 text-zinc-300 hover:text-white hover:bg-white/[0.08] rounded-xl size-9" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-white/[0.12] hidden sm:block"
            />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/admin/dashboard"
                    className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    {breadcrumbData.category}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-extrabold text-white">
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
                className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 text-[11px] font-black rounded-xl cursor-pointer hover:bg-amber-500/25 transition-all hidden lg:flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{pendingKycCount} KYC Reviews Waiting</span>
              </Badge>
            )}

            <div className="relative hidden md:block w-64">
              <Search className="size-3.5 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
              <Input
                placeholder="Search across PlusOnne..."
                className="bg-[#131824] border-white/[0.08] focus:border-[#0098FF] rounded-xl pl-9 pr-4 text-xs text-white h-9 w-full shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                <CheckCircle2 className="size-3 text-emerald-400" />
                <span>AWS ap-south-1 Live</span>
              </div>
              <button
                onClick={() => router.push("/admin/hosts")}
                className="relative p-2 rounded-xl bg-[#131824] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="size-4" />
                {pendingKycCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-500 text-black font-black text-[9px] flex items-center justify-center border-2 border-[#0D111A]">
                    {pendingKycCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

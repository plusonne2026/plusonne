"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";
import { useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HostAppSidebar } from "@/components/host/app-sidebar";

export default function HostsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isApplyPage = pathname === "/host/apply";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=" + pathname);
      } else if (user?.role !== "host" && !isApplyPage) {
        router.push("/home");
      }
    }
  }, [isLoading, isAuthenticated, user, isApplyPage, pathname, router]);

  if (isLoading || (!isAuthenticated && !isApplyPage) || (isAuthenticated && user?.role !== "host" && !isApplyPage)) {
    return <div className="min-h-screen bg-[#07090E]" />;
  }

  if (isApplyPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <HostAppSidebar />
      <SidebarInset className="bg-[#07090E] min-h-screen text-slate-100 flex flex-col font-outfit transition-colors w-full">
        <header className="flex h-16 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl px-4 sticky top-0 z-40 shadow-sm">
          <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl size-9" />
        </header>
        <div className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

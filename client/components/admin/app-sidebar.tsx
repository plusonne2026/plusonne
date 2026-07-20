"use client";

import * as React from "react";
import { useLayout } from "@/context/layout-provider";
import { Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarData } from "./data/sidebar-data";
import { NavGroup, type NavItem } from "@/components/admin/nav-group";
import { NavUser } from "./nav-user";
import { useAuth } from "@/app/lib/context/AuthContext";
import { AdminAPI } from "@/app/lib/api/admin.api";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { collapsible, variant } = useLayout();
  const { user } = useAuth();
  const [pendingKycCount, setPendingKycCount] = React.useState<number>(0);

  React.useEffect(() => {
    AdminAPI.getStats()
      .then((stats: any) => {
        if (stats && stats.pendingKycHosts !== undefined) {
          setPendingKycCount(stats.pendingKycHosts);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically inject pendingKycCount into our clean sidebarData structure
  const navGroupsWithDynamicBadges = React.useMemo(() => {
    return sidebarData.navGroups.map((group) => ({
      ...group,
      items: group.items.map((item: any) => {
        if (item.url?.includes("/hosts")) {
          return {
            ...item,
            badge: pendingKycCount > 0 ? pendingKycCount : undefined,
          };
        }
        return item;
      }),
    }));
  }, [pendingKycCount]);

  const activeUserData = React.useMemo(() => {
    if (!user) return sidebarData.user;
    return {
      name: user.displayName || sidebarData.user.name,
      email: user.email || sidebarData.user.email,
      avatar: user.avatarUrl || sidebarData.user.avatar,
      role: user.role || sidebarData.user.role,
    };
  }, [user]);

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      {...props}
      className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-sidebar-foreground shadow-2xl selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black"
    >
      <SidebarHeader className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="rounded-md p-2 cursor-default hover:bg-transparent text-left pointer-events-none"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black shadow-md shrink-0">
                <Sparkles className="size-5 text-white dark:text-black" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black tracking-tight text-zinc-900 dark:text-white">PlusOnne Platform</span>
                <span className="truncate text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Master Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 bg-white dark:bg-[#09090b] space-y-4 overflow-y-auto custom-scrollbar">
        {navGroupsWithDynamicBadges.map((group, idx) => (
          <NavGroup key={group.title || idx} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <NavUser user={activeUserData} />
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-black dark:hover:after:bg-white" />
    </Sidebar>
  );
}

export { AppSidebar as AdminAppSidebar };

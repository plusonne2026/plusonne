"use client";

import * as React from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { hostSidebarData } from "./data/sidebar-data";
import { NavGroup } from "@/components/admin/nav-group";
import { HostNavUser } from "./nav-user";
import { useAuth } from "@/app/lib/context/AuthContext";
import { BookingAPI } from "@/app/lib/api/booking.api";

export function HostAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = React.useState<number>(0);

  React.useEffect(() => {
    // We will poll or just fetch once for the MVP.
    // In real app, RTDB listener should be here.
    BookingAPI.getRequests()
      .then((reqs) => {
        if (reqs) {
          setPendingRequests(reqs.filter((r) => r.status === "pending_match").length);
        }
      })
      .catch(() => {});
  }, []);

  const navGroupsWithDynamicBadges = React.useMemo(() => {
    return hostSidebarData.navGroups.map((group) => ({
      ...group,
      items: group.items.map((item: any) => {
        if (item.url?.includes("/requests")) {
          return {
            ...item,
            badge: pendingRequests > 0 ? pendingRequests : undefined,
          };
        }
        return item;
      }),
    }));
  }, [pendingRequests]);

  const activeUserData = React.useMemo(() => {
    if (!user) return hostSidebarData.user;
    return {
      name: user.displayName || hostSidebarData.user.name,
      email: user.email || hostSidebarData.user.email,
      avatar: user.avatarUrl || hostSidebarData.user.avatar,
      role: user.role || hostSidebarData.user.role,
    };
  }, [user]);

  return (
    <Sidebar
      {...props}
      className="border-r border-white/10 bg-[#07090E] text-slate-100 shadow-2xl selection:bg-white selection:text-black"
    >
      <SidebarHeader className="p-3 border-b border-white/10 bg-[#07090E]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="rounded-xl p-2 cursor-default hover:bg-transparent text-left pointer-events-none"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0C4CD9] to-[#1C7AFF] text-white shadow-md shrink-0">
                <Sparkles className="size-5 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black tracking-tight text-white">PlusOne</span>
                <span className="truncate text-[10px] font-extrabold text-[#0098FF] uppercase tracking-wider">Host Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 bg-[#07090E] space-y-4 overflow-y-auto custom-scrollbar">
        {navGroupsWithDynamicBadges.map((group, idx) => (
          <NavGroup key={group.title || idx} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-white/10 bg-[#07090E]">
        <HostNavUser user={activeUserData} />
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-white/20" />
    </Sidebar>
  );
}

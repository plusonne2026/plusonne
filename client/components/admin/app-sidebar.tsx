"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings2,
  ExternalLink,
} from "lucide-react";

import { AdminTeamSwitcher } from "@/components/admin/team-switcher";
import { AdminNavMain } from "@/components/admin/nav-main";
import { AdminNavProjects } from "@/components/admin/nav-projects";
import { AdminNavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/app/lib/context/AuthContext";
import { AdminAPI } from "@/app/lib/api/admin.api";

export function AdminAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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

  const navMainData = [
    {
      title: "Dashboard Overview",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Host Network & KYC",
      url: "/admin/hosts",
      icon: ShieldCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
    },
    {
      title: "User Directory",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings2,
    },
  ];

  const quickProjects = [
    {
      name: "Public Platform Portal",
      url: "/",
      icon: ExternalLink,
      isExternal: true,
    },
  ];

  const userData = {
    name: user?.displayName || "Master Admin",
    email: user?.email || "admin@plusone.com",
    avatar: user?.avatarUrl || "",
    role: user?.role || "admin",
  };

  const handleSeedNotice = () => {
    alert("To re-seed sample users and host KYC profiles at any time, run in backend terminal:\n\nnpm run seed:admin\n\nDatabase: AWS DynamoDB PlusOne_Users & PlusOne_HostProfiles");
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-sidebar-border bg-[#0D111A]/95 text-sidebar-foreground shadow-2xl selection:bg-[#0098FF] selection:text-white"
    >
      <SidebarHeader className="p-3 border-b border-white/[0.06] bg-[#0D111A]">
        <AdminTeamSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 bg-[#0D111A] space-y-4 overflow-y-auto custom-scrollbar">
        <AdminNavMain items={navMainData} />
        <AdminNavProjects projects={quickProjects} onSeedData={handleSeedNotice} />
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-white/[0.06] bg-[#0D111A]">
        <AdminNavUser user={userData} />
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-[#0098FF]" />
    </Sidebar>
  );
}

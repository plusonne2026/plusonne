"use client";

import * as React from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  ShieldAlert,
  Database,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminNavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-2xl p-2.5 transition-all border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08]"
            >
              <Avatar className="h-9 w-9 rounded-xl border border-[#0098FF]/40 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-gradient-to-tr from-[#0C4CD9] to-purple-600 font-black text-xs text-white">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-white">{user.name || "Master Admin"}</span>
                <span className="truncate text-xs text-zinc-400">{user.email || "admin@plusone.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl bg-[#131824] border-white/[0.12] text-slate-100 p-2 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2.5 py-2.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-xl border border-[#0098FF]/50 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-gradient-to-tr from-[#0C4CD9] to-purple-600 font-black text-xs text-white">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-white">{user.name || "Master Admin"}</span>
                  <span className="truncate text-xs text-zinc-400">{user.email || "admin@plusone.com"}</span>
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded bg-[#0098FF]/20 px-1.5 py-0.5 text-[10px] font-black text-[#0098FF] uppercase tracking-wider">
                    Privilege: {user.role || "ADMIN"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
              >
                <Sparkles className="size-4 text-[#0098FF]" />
                <span>AWS DynamoDB Configuration</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/admin/dashboard")}
                className="gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
              >
                <BadgeCheck className="size-4 text-emerald-400" />
                <span>Executive Command Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/hosts")}
                className="gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
              >
                <CreditCard className="size-4 text-purple-400" />
                <span>Review Pending KYC Profiles</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="gap-3 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
              >
                <Settings className="size-4 text-amber-400" />
                <span>System Security & Architecture</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-3 rounded-xl px-3 py-2.5 text-xs font-black text-rose-300 hover:bg-rose-500/20 cursor-pointer"
            >
              <LogOut className="size-4 text-rose-400" />
              <span>Log out of Master Admin</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

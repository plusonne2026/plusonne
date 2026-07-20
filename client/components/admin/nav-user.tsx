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
              className="data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-900 data-[state=open]:text-zinc-900 dark:data-[state=open]:text-white rounded-md p-2.5 transition-all border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Avatar className="h-9 w-9 rounded-md border border-zinc-300 dark:border-zinc-700 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-md bg-black dark:bg-white font-black text-xs text-white dark:text-black">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-zinc-900 dark:text-white">{user.name || "Master Admin"}</span>
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email || "admin@plusone.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-md bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 p-2 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2.5 py-2.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-md border border-zinc-300 dark:border-zinc-700 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-md bg-black dark:bg-white font-black text-xs text-white dark:text-black">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-zinc-900 dark:text-white">{user.name || "Master Admin"}</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email || "admin@plusone.com"}</span>
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Privilege: {user.role || "ADMIN"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="gap-3 rounded-md px-3 py-2.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <Sparkles className="size-4 text-zinc-900 dark:text-white" />
                <span>AWS DynamoDB Configuration</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/admin/dashboard")}
                className="gap-3 rounded-md px-3 py-2.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <BadgeCheck className="size-4 text-zinc-900 dark:text-white" />
                <span>Executive Command Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/hosts")}
                className="gap-3 rounded-md px-3 py-2.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <CreditCard className="size-4 text-zinc-900 dark:text-white" />
                <span>Review Pending KYC Profiles</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="gap-3 rounded-md px-3 py-2.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <Settings className="size-4 text-zinc-900 dark:text-white" />
                <span>System Security & Architecture</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-3 rounded-xl px-3 py-2.5 text-xs font-black text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 cursor-pointer"
            >
              <LogOut className="size-4 text-rose-500 dark:text-rose-400" />
              <span>Log out of Master Admin</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { AdminNavUser as NavUser };

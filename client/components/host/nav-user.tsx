"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
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

export function HostNavUser({
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
    router.push("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/10 data-[state=open]:text-white rounded-xl p-2.5 transition-all border border-white/5 bg-white/5 hover:bg-white/10"
            >
              <Avatar className="h-9 w-9 rounded-xl border border-white/20 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-[#0C4CD9] font-black text-xs text-white">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "HO"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight text-white">
                <span className="truncate font-bold">{user.name || "Host User"}</span>
                <span className="truncate text-xs text-slate-400">{user.email || "host@plusone.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl bg-[#0F1219] border-white/10 text-white p-2 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2.5 py-2.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-xl border border-white/20 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-[#0C4CD9] font-black text-xs text-white">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "HO"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">{user.name || "Host User"}</span>
                  <span className="truncate text-xs text-slate-400">{user.email || "host@plusone.com"}</span>
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded bg-[#0C4CD9]/20 border border-[#0C4CD9]/30 px-1.5 py-0.5 text-[10px] font-black text-[#0098FF] uppercase tracking-wider">
                    Privilege: {user.role || "HOST"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => router.push("/host/profile")} className="gap-2 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg p-2.5">
              <UserCircle className="size-4 text-slate-400" />
              <span className="font-medium">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer focus:bg-red-500/10 focus:text-red-500 text-red-400 rounded-lg p-2.5">
              <LogOut className="size-4" />
              <span className="font-bold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

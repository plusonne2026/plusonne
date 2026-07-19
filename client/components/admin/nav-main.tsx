"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function AdminNavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: number | string;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 px-3 py-2">
        Main Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            (pathname !== "/admin" && pathname !== "/" && pathname?.startsWith(item.url));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`rounded-2xl px-3.5 py-3 h-11 transition-all ${
                  isActive
                    ? "bg-[#0098FF] text-white font-black shadow-lg shadow-[#0098FF]/25 border border-[#0098FF]"
                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white font-bold"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3 w-full">
                  <item.icon
                    className={`size-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#0098FF]"
                    }`}
                  />
                  <span className="flex-1 truncate text-xs">{item.title}</span>
                  {item.badge !== undefined && (
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${
                        isActive
                          ? "bg-white text-[#0C4CD9] border-none shadow-sm"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

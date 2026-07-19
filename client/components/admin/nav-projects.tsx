"use client";

import * as React from "react";
import { type LucideIcon, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AdminNavProjects({
  projects,
  onSeedData,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    isExternal?: boolean;
    badge?: string;
  }[];
  onSeedData?: () => void;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 px-3 py-2">
        Quick Access
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1.5">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              tooltip={item.name}
              className="rounded-2xl px-3.5 py-2.5 h-10 text-zinc-300 hover:bg-white/[0.06] hover:text-white font-bold transition-all"
            >
              {item.isExternal ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <item.icon className="size-4 text-[#0098FF] shrink-0" />
                  <span className="flex-1 truncate text-xs">{item.name}</span>
                </a>
              ) : (
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-4 text-purple-400 shrink-0" />
                  <span className="flex-1 truncate text-xs">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-extrabold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {onSeedData && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSeedData}
              tooltip="Re-Seed Sample Data"
              className="rounded-2xl px-3.5 py-2.5 h-10 text-emerald-300 hover:bg-emerald-500/15 font-extrabold border border-emerald-500/30 transition-all cursor-pointer mt-1"
            >
              <RefreshCw className="size-4 text-emerald-400 shrink-0" />
              <span className="flex-1 truncate text-xs">Re-Seed Sample Data</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">npm</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

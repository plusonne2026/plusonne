"use client";

import * as React from "react";
import { ChevronsUpDown, Sparkles, ShieldCheck, Database, Layers } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminTeamSwitcher() {
  const { isMobile } = useSidebar();
  
  const portals = [
    {
      name: "PlusOnne Platform",
      logo: Sparkles,
      plan: "Master Admin",
    },
    {
      name: "KYC Review Portal",
      logo: ShieldCheck,
      plan: "Verification",
    },
    {
      name: "AWS DynamoDB Engine",
      logo: Database,
      plan: "ap-south-1",
    },
  ];

  const [activePortal, setActivePortal] = React.useState(portals[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all rounded-2xl p-2"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0098FF] to-purple-600 text-sidebar-primary-foreground shadow-lg shadow-[#0098FF]/25 shrink-0">
                <activePortal.logo className="size-5 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black tracking-tight text-white">{activePortal.name}</span>
                <span className="truncate text-[10px] font-extrabold text-[#0098FF] uppercase tracking-wider">{activePortal.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-[#131824] border-white/[0.12] text-slate-100 p-2 shadow-2xl"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2 py-1.5">
              Switch Command Center
            </DropdownMenuLabel>
            {portals.map((portal, index) => (
              <DropdownMenuItem
                key={portal.name}
                onClick={() => setActivePortal(portal)}
                className="gap-3 rounded-xl p-2.5 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.05]">
                  <portal.logo className="size-4 text-[#0098FF]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white">{portal.name}</span>
                  <span className="text-[10px] text-zinc-400">{portal.plan}</span>
                </div>
                <DropdownMenuShortcut className="font-mono text-[10px] text-zinc-500">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/[0.08] my-1" />
            <DropdownMenuItem className="gap-2.5 rounded-xl p-2 text-xs font-extrabold text-purple-300 hover:bg-purple-500/20 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border border-purple-500/30 bg-purple-500/10">
                <Layers className="size-3.5" />
              </div>
              <span>Environment: Production / ap-south-1</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

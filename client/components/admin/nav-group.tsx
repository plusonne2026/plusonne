"use client";

import * as React from "react";
import { type LucideIcon, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: number | string;
  isExternal?: boolean;
  items?: {
    title: string;
    url: string;
    badge?: number | string;
  }[];
}

export interface NavGroupProps {
  title?: string;
  items: NavItem[];
}

export function NavGroup({ title, items }: NavGroupProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1.5">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isExactOrExternal =
            item.url === "/" || item.url === "/admin" || item.isExternal;
          const isActive =
            pathname === item.url ||
            (!isExactOrExternal &&
              pathname !== "/admin" &&
              pathname !== "/" &&
              (pathname?.startsWith(`${item.url}/`) || pathname?.startsWith(item.url)));

          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`rounded-md px-3.5 py-3 h-11 transition-all ${
                        isActive
                          ? "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-white font-black dark:border-zinc-800 shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white font-bold"
                      }`}
                    >
                      {item.icon && <item.icon className="size-4 shrink-0 text-zinc-500 group-hover/collapsible:text-zinc-900 dark:text-zinc-400 dark:group-hover/collapsible:text-white" />}
                      <span className="flex-1 truncate text-xs">{item.title}</span>
                      {item.badge !== undefined && (
                        <Badge className="bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 px-1.5 py-0 text-[10px] font-black rounded-md">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-zinc-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-zinc-200 dark:border-zinc-800 ml-5 pl-2.5 space-y-1 mt-1">
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={`rounded-md px-3 py-2 h-9 transition-all text-xs ${
                                isSubActive
                                  ? "bg-black text-white dark:bg-white dark:text-black font-black shadow-md hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 font-semibold"
                              }`}
                            >
                              <Link href={subItem.url} className="flex items-center justify-between w-full">
                                <span>{subItem.title}</span>
                                {subItem.badge !== undefined && (
                                  <Badge className="bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white px-1.5 py-0 text-[9px] font-bold">
                                    {subItem.badge}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`rounded-md px-3.5 py-3 h-11 transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black font-black shadow-md border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white font-bold"
                }`}
              >
                <Link
                  href={item.url}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 w-full"
                >
                  {item.icon && (
                    <item.icon
                      className={`size-4 shrink-0 transition-colors ${
                        isActive ? "text-white dark:text-black" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                      }`}
                    />
                  )}
                  <span className="flex-1 truncate text-xs">{item.title}</span>
                  {item.badge !== undefined && (
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                        isActive
                          ? "bg-white text-black border border-white dark:bg-black dark:text-white dark:border-black"
                          : typeof item.badge === "number" && item.badge > 0
                          ? "bg-black text-white border border-zinc-700 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 animate-pulse"
                          : item.badge
                          ? "bg-zinc-200 text-zinc-800 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                          : "hidden"
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

import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Settings,
  Bell,
  Sparkles,
} from "lucide-react";
import type { NavGroupProps } from "@/components/admin/nav-group";

export const hostSidebarData = {
  user: {
    name: "Companion Host",
    email: "host@plusone.com",
    avatar: "",
    role: "host",
  },
  navGroups: [
    {
      items: [
        {
          title: "Dashboard Overview",
          url: "/host/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Incoming Requests",
          url: "/host/requests",
          icon: Bell,
          badge: 0, // dynamic
        },
        {
          title: "My Schedule",
          url: "/host/schedule",
          icon: Calendar,
        },
        {
          title: "Earnings",
          url: "/host/earnings",
          icon: Wallet,
        },
        {
          title: "Profile Settings",
          url: "/host/profile",
          icon: Settings,
        },
      ],
    },
  ],
};

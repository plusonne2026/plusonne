import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings2,
  ExternalLink,
  Sparkles,
  Database,
  AlertCircle,
  Map,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import type { NavGroupProps } from "@/components/admin/nav-group";

export interface SidebarData {
  teams: {
    name: string;
    logo: LucideIcon;
    plan: string;
  }[];
  navGroups: NavGroupProps[];
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}

export const sidebarData: SidebarData = {
  teams: [
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
  ],
  navGroups: [
    {
      items: [
        {
          title: "Dashboard Overview",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "SOS Operations",
          url: "/admin/sos",
          icon: AlertCircle,
        },
        {
          title: "Global GPS Map",
          url: "/admin/map",
          icon: Map,
        },
        {
          title: "Finance & Payouts",
          url: "/admin/finance",
          icon: Banknote,
        },
        {
          title: "Host Network & KYC",
          url: "/admin/hosts",
          icon: ShieldCheck,
          badge: 0, // Dynamically updated if KYC pending exists
        },
        {
          title: "User Directory",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "Subscription Plans",
          url: "/admin/plans",
          icon: Database,
        },
        {
          title: "Global Settings",
          url: "/admin/settings",
          icon: Settings2,
        },
        {
          title: "Service Categories",
          url: "/admin/categories",
          icon: ExternalLink,
        },
        {
          title: "Packages",
          url: "/admin/packages",
          icon: Database,
        },
      ],
    },
  ],
  user: {
    name: "Master Admin",
    email: "admin@plusone.com",
    avatar: "",
    role: "admin",
  },
};

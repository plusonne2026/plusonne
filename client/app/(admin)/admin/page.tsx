"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRootRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/admin/login");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center font-outfit">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0098FF]" />
        <span className="text-xs font-bold text-zinc-400">Initializing Admin Portal...</span>
      </div>
    </div>
  );
}

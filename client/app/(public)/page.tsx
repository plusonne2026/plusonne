"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/context/AuthContext";
import LandingHome from "../components/landing/Home";

export default function PublicLandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#080A10]" />;
  }

  // If authenticated, we are redirecting so return a blank screen briefly
  if (isAuthenticated) {
    return <div className="min-h-screen bg-[#080A10]" />;
  }

  return <LandingHome />;
}

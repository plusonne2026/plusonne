"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";
import { HostAPI, HostProfile } from "@/app/lib/api/host.api";
import {
  CheckCircle2,
  Sparkles,
  Star,
  Clock,
  ShieldCheck,
  Banknote,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function HostDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/host/dashboard");
      return;
    }
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await HostAPI.getProfile();
      setProfile(data);
      const realEarnings = await HostAPI.getEarnings();
      if (realEarnings && data) {
        setProfile((prev: any) => ({
          ...prev,
          earnings: {
            thisMonth: realEarnings.thisMonth || prev.earnings.thisMonth,
            lastMonth: realEarnings.lastMonth || prev.earnings.lastMonth,
            total: realEarnings.total || prev.earnings.total,
            pending: realEarnings.pending || prev.earnings.pending,
          },
        }));
      }
    } catch (err: any) {
      if (err.status === 404) {
        router.push("/host/apply");
      } else {
        // Fallback mock profile
        setProfile({
          hostId: user?.userId || "host_preview",
          displayName: user?.displayName || "Verified Companion Host",
          avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          city: user?.city || "Mumbai",
          categories: ["coffee_date", "explorer", "event"],
          bio: "Friendly, articulate companion for quiet coffee chats, city tours, and corporate galas.",
          isOnline: true,
          rating: 4.95,
          totalReviews: 18,
          totalCompletions: 24,
          totalCancellations: 0,
          responseTimeAvg: 95,
          completionRate: 100,
          languages: ["English", "Hindi"],
          experienceYears: 2,
          kycStatus: "verified",
          kycDocuments: { aadhaarUrl: "verified", panUrl: "verified", photoUrl: "verified" },
          bankDetails: null,
          hostTrustScore: 94,
          earnings: { thisMonth: 18400, lastMonth: 32000, total: 50400, pending: 4200 },
          schedule: [],
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div className="h-full w-full flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your hosting business, track earnings, and view your stats.</p>
        </div>
      </div>

      {/* Banner: Profile Summary & Availability Toggle */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#0D111A] via-[#131824] to-[#1A2234] border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0098FF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex items-start sm:items-center gap-5 z-10">
          <div className="relative shrink-0">
            <img
              src={profile?.kycDocuments?.photoUrl || profile?.avatarUrl || user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white/[0.15] shadow-xl"
            />
            <span
              className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${profile?.isOnline ? "bg-emerald-500 text-white border-emerald-400" : "bg-zinc-700 text-zinc-300 border-zinc-600"
                }`}
            >
              {profile?.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, {profile?.displayName || user?.displayName}
              </h1>
              {profile?.kycStatus === "verified" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Host
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> KYC Under Review
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed line-clamp-2 italic">
              "{profile?.bio || "Passionate host ready to provide great company."}"
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile?.rating || 4.9} ({profile?.totalReviews || 12} Reviews)
              </span>
              <span>•</span>
              <span>{profile?.experienceYears || 2} Yrs Experience</span>
              <span>•</span>
              <span className="text-[#0098FF]">{profile?.city || "Mumbai"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={async () => {
              if (profile) {
                const newStatus = !profile.isOnline;
                // Optimistic update
                setProfile({ ...profile, isOnline: newStatus });
                try {
                  await HostAPI.updateOnlineStatus(newStatus);
                } catch (err) {
                  // Revert on error
                  setProfile({ ...profile, isOnline: !newStatus });
                  toast.error("Failed to update status");
                }
              }
            }}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-xl ${profile?.isOnline
              ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500"
              : "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
              }`}
          >
            <div className={`w-3 h-3 rounded-full ${profile?.isOnline ? "bg-white animate-pulse" : "bg-zinc-500"}`} />
            <span>{profile?.isOnline ? "Available for Bookings" : "Currently Offline"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 font-bold block">This Month Earnings</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{profile?.earnings?.thisMonth?.toLocaleString() || "18,400"}
          </span>
          <span className="text-[10px] text-zinc-500 block">+18% vs last month</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 font-bold block">Pending Payout</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{profile?.earnings?.pending?.toLocaleString() || "4,200"}
          </span>
          <span className="text-[10px] text-zinc-500 block">Clears within 48h</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 font-bold block">Total Sessions</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{profile?.totalCompletions || 24}</span>
          <span className="text-[10px] text-emerald-400 block">100% completion rate</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <span className="text-xs text-zinc-400 font-bold block">Host Trust Score</span>
          <span className="text-2xl sm:text-3xl font-black text-[#0098FF]">{profile?.hostTrustScore || 94}/100</span>
          <span className="text-[10px] text-zinc-500 block">Tier 1 Gold Companion</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../lib/context/AuthContext";
import { HostAPI, HostProfile } from "../../lib/api/host.api";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Coins,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function HostMainPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [checkingHost, setCheckingHost] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        checkHostStatus();
      } else {
        setCheckingHost(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const checkHostStatus = async () => {
    setCheckingHost(true);
    try {
      const data = await HostAPI.getProfile();
      setProfile(data);
    } catch (err: any) {
      // User has not applied as host yet
      setProfile(null);
    } finally {
      setCheckingHost(false);
    }
  };

  if (authLoading || checkingHost) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white font-outfit">
        <Loader2 className="w-10 h-10 animate-spin text-[#0098FF] mb-4" />
        <p className="text-sm font-bold text-zinc-400">Loading Host Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-outfit relative selection:bg-[#0098FF]/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-b from-[#0098FF]/15 via-purple-600/10 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0D111A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer group">
            <Image
              src="/PlusOnne%20Logo%20PNG.png"
              alt="PlusOnne Logo"
              width={40}
              height={40}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
                PlusOnne
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-widest">
                Host Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-zinc-300 transition-all"
            >
              User App
            </button>
            {profile ? (
              <button
                onClick={() => router.push("/host/dashboard")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] text-white text-xs font-extrabold shadow-lg shadow-[#0098FF]/20 hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => router.push(isAuthenticated ? "/host/apply" : "/auth/login?redirect=/host/apply")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply as Host</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {profile ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Active Host Profile Found
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Join India's Premiere Companion Network
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Turn Your Companionship & Skills into <br />
            <span className="bg-gradient-to-r from-[#0098FF] via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Guaranteed Monthly Income
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the PlusOnne Host Portal. Host clients for coffee dates, city tours, galas, and fitness sessions with complete safety, flexible hours, and guaranteed 70/30 revenue share.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {profile ? (
              <button
                onClick={() => router.push("/host/dashboard")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-[#0098FF]/30 hover:scale-105 transition-all"
              >
                <Briefcase className="w-5 h-5" />
                <span>Open Host Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push(isAuthenticated ? "/host/apply" : "/auth/login?redirect=/host/apply")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-zinc-950 font-extrabold text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5 text-zinc-950" />
                <span>Start Host Application</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
            )}

            <button
              onClick={() => router.push("/host/apply")}
              className="px-6 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <span>View Requirements</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-[28px] bg-[#0D111A] border border-white/[0.08] hover:border-[#0098FF]/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0C4CD9] to-[#0098FF] flex items-center justify-center text-white shadow-lg shadow-[#0098FF]/20">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">70/30 Revenue Share</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Earn 70% of every completed session fee + 100% of guest tips with guaranteed direct payouts clearing into your bank account within 48 hours.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-[#0D111A] border border-white/[0.08] hover:border-purple-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">NGO Safety & Protocol</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All hosts receive free NGO soft skills training, real-time GPS check-ins, and a 24/7 emergency dispatch SOS button for absolute safety.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-[#0D111A] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">100% Flexible Hours</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Set your own weekly availability, pick categories (Coffee, City Guide, VIP Events, Fitness), and toggle your online availability anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07090E] py-6 text-center text-xs text-zinc-500">
        <p>© 2026 PlusOnne Host Network. All rights reserved. NGO Certified & Safety Verified.</p>
      </footer>
    </div>
  );
}

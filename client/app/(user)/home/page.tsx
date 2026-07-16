"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import {
  LogOut,
  User as UserIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Compass,
  Calendar,
  Wallet,
  Bell,
  ChevronRight,
  HeartHandshake,
  Star,
  Activity,
} from "lucide-react";

export default function UserHomePage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0C4CD9] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading your PlusOne experience...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or no user session, allow quick return or show generic guest prompt
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Valued Guest";
  const userCity = user?.city || "Mumbai";
  const trustScore = user?.trustScore ?? 85;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-outfit relative overflow-hidden">
      {/* Luxury Radial Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#0C4CD9]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#9B51E0]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0D111A]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0C4CD9] to-[#9B51E0] flex items-center justify-center shadow-lg shadow-[#0C4CD9]/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PlusOne
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#0C4CD9] font-semibold">
                Attendee Portal
              </span>
            </div>
          </div>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#0C4CD9]" />
              <span className="text-slate-300 font-medium">{userCity}</span>
            </div>

            <div className="flex items-center gap-3 bg-[#131926]/90 border border-white/[0.08] pl-2 pr-3 py-1.5 rounded-full shadow-inner">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-[#0C4CD9]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0C4CD9] to-[#9B51E0] flex items-center justify-center text-xs font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {displayName}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow-rose-500/10 active:scale-95 cursor-pointer"
              title="Logout from PlusOne"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10">
        {/* Welcome Hero Banner */}
        <section className="bg-gradient-to-r from-[#111726] via-[#141B2D] to-[#181F33] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-[#0C4CD9]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-[#9B51E0]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C4CD9]/15 border border-[#0C4CD9]/30 text-blue-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified PlusOne Member
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#A855F7] bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Your premium companion & lifestyle booking portal. Discover top-rated hosts, explore tailored city packages, and track live sessions with complete safety.
              </p>
            </div>

            {/* Trust Score Pill Card */}
            <div className="bg-[#07090E]/80 backdrop-blur-md border border-white/[0.1] rounded-2xl p-5 min-w-[200px] flex items-center gap-4 shadow-lg self-stretch sm:self-auto justify-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {trustScore}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Trust Score
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Action Category Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Platform Features & Navigation
            </h2>
            <span className="text-xs text-slate-400">Select an area to explore</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Explore Packages */}
            <div
              onClick={() => router.push("/packages")}
              className="group bg-[#0E131F]/90 hover:bg-[#131A2B] border border-white/[0.08] hover:border-[#0C4CD9]/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-[#0C4CD9]/10 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  Explore Packages
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browse city tours, weekend coffee meets, and curated event packages in {userCity}.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Packages</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Find Hosts */}
            <div
              onClick={() => router.push("/hosts")}
              className="group bg-[#0E131F]/90 hover:bg-[#131A2B] border border-white/[0.08] hover:border-[#9B51E0]/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-[#9B51E0]/10 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                  Verified Hosts
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect with KYC-verified companions nearby for sports, dining, and city exploration.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-purple-400 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Find Companions</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: My Bookings */}
            <div
              onClick={() => router.push("/bookings")}
              className="group bg-[#0E131F]/90 hover:bg-[#131A2B] border border-white/[0.08] hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  My Bookings
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  View upcoming sessions, track live GPS locations, and download session invoices.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Sessions</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Wallet & Units */}
            <div
              onClick={() => router.push("/wallet")}
              className="group bg-[#0E131F]/90 hover:bg-[#131A2B] border border-white/[0.08] hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                  Wallet & Units
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage subscription plans, purchase prepaid hours/distance units, and check balance.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-amber-400 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Check Wallet</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Status & Information Box */}
        <div className="bg-[#0E131F] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-base font-bold text-white">System Status & Next Phase</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Your authenticated session is active and securely linked with your Firebase token (`{user?.userId || "Guest"}`). In the upcoming development steps, dynamic Categories, Popular Packages, and verified Nearby Hosts will be fetched directly from our DynamoDB backend without any mock data placeholders.
          </p>
        </div>
      </main>
    </div>
  );
}

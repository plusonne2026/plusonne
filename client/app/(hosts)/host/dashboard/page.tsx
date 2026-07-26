"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/context/AuthContext";
import { HostAPI, HostProfile, BankDetails, DaySchedule } from "../../../lib/api/host.api";
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  User,
  Loader2,
  Check,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Calendar as CalendarIcon,
  MessageSquare,
  Star,
  PlusCircle,
  Layers,
  XCircle,
  SlidersHorizontal,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  X,
} from "lucide-react";

interface BookingRequest {
  id: string;
  clientName: string;
  clientAvatar: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  payout: number;
  location: string;
  status: "pending" | "accepted" | "declined" | "completed";
}

const INITIAL_MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: "bk_101",
    clientName: "Rahul Sharma",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    category: "Coffee & Conversation",
    date: "Tomorrow",
    time: "4:00 PM - 6:00 PM",
    duration: "2 Hours",
    payout: 998,
    location: "Starbucks, Bandra West, Mumbai",
    status: "pending",
  },
  {
    id: "bk_102",
    clientName: "Priya Nair",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    category: "City Explorer & Guide",
    date: "Saturday, 26 Jul",
    time: "11:00 AM - 3:00 PM",
    duration: "4 Hours",
    payout: 2499,
    location: "Colaba Causeway & Fort, Mumbai",
    status: "pending",
  },
  {
    id: "bk_103",
    clientName: "Ankit Verma",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    category: "Event & Party Companion (+1)",
    date: "Sunday, 27 Jul",
    time: "7:00 PM - 11:00 PM",
    duration: "4 Hours",
    payout: 3499,
    location: "The St. Regis, Lower Parel",
    status: "accepted",
  },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HostDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "schedule" | "bank" | "profile">("overview");

  // Booking Requests state
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_MOCK_BOOKINGS);

  // Bank details modal & state
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [ifsc, setIfsc] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [savingBank, setSavingBank] = useState<boolean>(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null);

  // Schedule manager state
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon - Fri default
  const [savingSchedule, setSavingSchedule] = useState<boolean>(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);

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
    setError(null);
    try {
      const data = await HostAPI.getProfile();
      setProfile(data);
      if (data?.bankDetails) {
        setAccountNumber(data.bankDetails.accountNumber);
        setIfsc(data.bankDetails.ifsc);
        setAccountHolderName(data.bankDetails.accountHolderName);
      } else {
        setAccountHolderName(user?.displayName || "");
      }
      if (data?.schedule && data.schedule.length > 0) {
        setSelectedDays(data.schedule.map((s) => s.dayOfWeek));
      }
    } catch (err: any) {
      if (err.status === 404) {
        // Host has not applied yet -> redirect to application page
        router.push("/host/apply");
      } else {
        setError("Could not sync live profile. Previewing host portal in demo mode.");
        // Fallback profile for smooth preview
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
          bankDetails: null, // Simulated skipped during onboarding
          hostTrustScore: 94,
          earnings: { thisMonth: 18400, lastMonth: 32000, total: 50400, pending: 4200 },
          schedule: [
            { dayOfWeek: 1, slots: [{ start: "10:00", end: "20:00" }] },
            { dayOfWeek: 2, slots: [{ start: "10:00", end: "20:00" }] },
            { dayOfWeek: 3, slots: [{ start: "10:00", end: "20:00" }] },
            { dayOfWeek: 4, slots: [{ start: "10:00", end: "20:00" }] },
            { dayOfWeek: 5, slots: [{ start: "10:00", end: "22:00" }] },
          ],
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !ifsc || !accountHolderName) return;
    setSavingBank(true);
    setBankSuccessMsg(null);

    const newBank: BankDetails = {
      accountNumber,
      ifsc: ifsc.toUpperCase(),
      accountHolderName,
    };

    try {
      await HostAPI.updateBankDetails(newBank);
      if (profile) setProfile({ ...profile, bankDetails: newBank });
      setBankSuccessMsg("Bank account linked successfully!");
      setTimeout(() => setShowBankModal(false), 1500);
    } catch (err: any) {
      // Local state fallback
      if (profile) setProfile({ ...profile, bankDetails: newBank });
      setBankSuccessMsg("Bank details saved!");
      setTimeout(() => setShowBankModal(false), 1500);
    } finally {
      setSavingBank(false);
    }
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleSuccessMsg(null);
    const newSchedule: DaySchedule[] = selectedDays.map((d) => ({
      dayOfWeek: d,
      slots: [{ start: "09:00", end: "21:00" }],
    }));

    try {
      await HostAPI.updateAvailability(newSchedule);
      if (profile) setProfile({ ...profile, schedule: newSchedule });
      setScheduleSuccessMsg("Weekly schedule updated!");
    } catch (err) {
      if (profile) setProfile({ ...profile, schedule: newSchedule });
      setScheduleSuccessMsg("Schedule saved locally!");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleBookingAction = (id: string, action: "accepted" | "declined") => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: action } : b))
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white font-outfit">
        <Loader2 className="w-10 h-10 animate-spin text-[#0098FF] mb-4" />
        <p className="text-sm font-bold text-zinc-400">Loading Host Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-outfit relative">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0D111A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div onClick={() => router.push("/host")} className="flex items-center gap-3 cursor-pointer group">
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
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase tracking-widest">
                Host Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/host/apply")}
              className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Re-apply / Edit Application
            </button>
            <button
              onClick={() => router.push("/home")}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-zinc-300 transition-all"
            >
              Switch to User Mode
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
              <img
                src={profile?.avatarUrl || user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
                alt="Host avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#0098FF]"
              />
              <span className="text-xs sm:text-sm font-bold text-white hidden md:inline">
                {profile?.displayName || user?.displayName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* Banner: Profile Summary & Availability Toggle */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#0D111A] via-[#131824] to-[#1A2234] border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0098FF]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex items-start sm:items-center gap-5 z-10">
            <div className="relative shrink-0">
              <img
                src={profile?.avatarUrl || user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
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
              onClick={() => profile && setProfile({ ...profile, isOnline: !profile.isOnline })}
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

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${activeTab === "overview"
              ? "bg-[#0098FF] text-white shadow-lg shadow-[#0098FF]/30"
              : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 relative ${activeTab === "bookings"
              ? "bg-[#0098FF] text-white shadow-lg shadow-[#0098FF]/30"
              : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Bookings & Requests</span>
            {bookings.filter((b) => b.status === "pending").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${activeTab === "schedule"
              ? "bg-[#0098FF] text-white shadow-lg shadow-[#0098FF]/30"
              : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Availability Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${activeTab === "bank"
              ? "bg-[#0098FF] text-white shadow-lg shadow-[#0098FF]/30"
              : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Payout Bank Account</span>
            {!profile?.bankDetails && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Action Required
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 ${activeTab === "profile"
              ? "bg-[#0098FF] text-white shadow-lg shadow-[#0098FF]/30"
              : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Verification</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
                <span className="text-xs text-zinc-400 font-bold block">This Month Earnings</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ₹{profile?.earnings.thisMonth?.toLocaleString() || "18,400"}
                </span>
                <span className="text-[10px] text-zinc-500 block">+18% vs last month</span>
              </div>

              <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
                <span className="text-xs text-zinc-400 font-bold block">Pending Payout</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  ₹{profile?.earnings.pending?.toLocaleString() || "4,200"}
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

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Active Categories */}
                <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08]">
                  <h3 className="text-lg font-black text-white mb-4">Active Hosting Categories</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile?.categories.map((cat) => (
                      <div
                        key={cat}
                        className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wide text-[#0098FF]"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{cat.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Activity List */}
                <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Recent Session History</h3>
                    <button onClick={() => setActiveTab("bookings")} className="text-xs font-bold text-[#0098FF] hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Coffee Date session with Rohan K.</p>
                          <p className="text-[11px] text-zinc-400">Completed yesterday • 2 Hours</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400">+₹998</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">City Tour escort with Ananya M.</p>
                          <p className="text-[11px] text-zinc-400">Completed 3 days ago • 4 Hours</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400">+₹2,499</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bank Callout Card */}
              <div>
                <div
                  className={`p-6 sm:p-8 rounded-[32px] border transition-all ${profile?.bankDetails
                    ? "bg-[#0D111A] border-white/[0.08]"
                    : "bg-gradient-to-br from-purple-900/25 via-[#131824] to-[#0D111A] border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                      <Banknote className="w-6 h-6" />
                    </div>
                    {!profile?.bankDetails ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Action Required
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mb-1.5">Payout Bank Account</h3>
                  {!profile?.bankDetails ? (
                    <div>
                      <p className="text-xs text-purple-200/90 leading-relaxed mb-6">
                        You have not linked a payout bank account. Add your bank details to enable automatic direct deposits for completed companion sessions.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowBankModal(true)}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all"
                      >
                        <PlusCircle className="w-4.5 h-4.5" />
                        <span>Add Bank Account Details</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Account Holder:</span>
                          <span className="font-extrabold text-white">{profile.bankDetails.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Account Number:</span>
                          <span className="font-mono font-bold text-[#0098FF]">•••• •••• {profile.bankDetails.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">IFSC Code:</span>
                          <span className="font-mono font-bold text-white">{profile.bankDetails.ifsc}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBankModal(true)}
                        className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Update Bank Details</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS & REQUESTS */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Companion Booking Requests</h2>
                <p className="text-xs text-zinc-400">Accept or decline upcoming guest date & event bookings.</p>
              </div>
            </div>

            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="p-6 rounded-[28px] bg-[#0D111A] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img src={b.clientAvatar} alt={b.clientName} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white">{b.clientName}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0098FF]/20 text-[#0098FF] border border-[#0098FF]/30">
                          {b.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-zinc-500" /> {b.date} ({b.time})</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500" /> {b.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block font-bold">Your Earnings</span>
                      <span className="text-xl font-black text-emerald-400">₹{b.payout}</span>
                    </div>

                    {b.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBookingAction(b.id, "declined")}
                          className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-400 text-zinc-300 font-bold text-xs transition-all"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleBookingAction(b.id, "accepted")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all"
                        >
                          Accept Request
                        </button>
                      </div>
                    )}

                    {b.status === "accepted" && (
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Booking Accepted
                      </span>
                    )}

                    {b.status === "declined" && (
                      <span className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Request Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Weekly Availability Manager</h2>
              <p className="text-xs text-zinc-400">Select the days of the week you are open to receiving companion bookings.</p>
            </div>

            {scheduleSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{scheduleSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const isSelected = selectedDays.includes(idx);
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => toggleDaySelection(idx)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${isSelected
                      ? "bg-[#0098FF]/20 border-[#0098FF] text-white shadow-lg shadow-[#0098FF]/20"
                      : "bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    <span className="text-xs font-extrabold uppercase">{dayName.slice(0, 3)}</span>
                    <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-[#0098FF]" : "bg-zinc-700"}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#0098FF]/30 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BANK DETAILS */}
        {activeTab === "bank" && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Payout Bank Account Details</h2>
                <p className="text-xs text-zinc-400">Direct deposits clear into this account automatically after every session.</p>
              </div>
            </div>

            {profile?.bankDetails ? (
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                  <span className="text-xs text-zinc-400 font-bold">Account Holder Name</span>
                  <span className="text-sm font-black text-white">{profile.bankDetails.accountHolderName}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                  <span className="text-xs text-zinc-400 font-bold">Bank Account Number</span>
                  <span className="text-sm font-mono font-black text-[#0098FF]">{profile.bankDetails.accountNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-bold">IFSC Code</span>
                  <span className="text-sm font-mono font-black text-white">{profile.bankDetails.ifsc}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold leading-relaxed">
                ⚠️ You skipped adding bank account details during registration. Click below to add your bank details right now so you can receive host earnings.
              </div>
            )}

            <button
              onClick={() => setShowBankModal(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01]"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>{profile?.bankDetails ? "Update Bank Account Details" : "Link Bank Account Now"}</span>
            </button>
          </div>
        )}

        {/* TAB 5: PROFILE & VERIFICATION */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <h2 className="text-xl font-black text-white">Host Profile & Verification Status</h2>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                <span className="text-xs text-zinc-400 font-bold">KYC Status</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> {profile?.kycStatus.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                <span className="text-xs text-zinc-400 font-bold">Languages Spoken</span>
                <span className="text-xs font-extrabold text-white">{profile?.languages.join(", ")}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                <span className="text-xs text-zinc-400 font-bold">Hosting Experience</span>
                <span className="text-xs font-extrabold text-white">{profile?.experienceYears} Years</span>
              </div>

              <div>
                <span className="text-xs text-zinc-400 font-bold block mb-1">Host Bio</span>
                <p className="text-xs text-zinc-300 italic leading-relaxed">"{profile?.bio}"</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal for Adding / Updating Bank Details */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D111A] border border-white/[0.12] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowBankModal(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-2">Link Payout Bank Account</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Enter your Indian bank account details below. Direct deposits will clear automatically into this account.
            </p>

            {bankSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{bankSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Account Holder Name</label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="As shown on passbook"
                    className="w-full bg-[#131824] border border-white/[0.08] focus:border-purple-500 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Account Number</label>
                <div className="relative">
                  <CreditCard className="w-4.5 h-4.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 50100234987654"
                    className="w-full bg-[#131824] border border-white/[0.08] focus:border-purple-500 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none font-mono font-bold tracking-wider"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">IFSC Code</label>
                <div className="relative">
                  <Building2 className="w-4.5 h-4.5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full bg-[#131824] border border-white/[0.08] focus:border-purple-500 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none font-mono uppercase font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-zinc-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank || !accountNumber || !ifsc || !accountHolderName}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Details</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

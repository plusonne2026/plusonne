"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../lib/context/AuthContext";
import { HostAPI, HostProfile } from "../../lib/api/host.api";
import { PricingAPI } from "../../lib/api/pricing.api";
import {
  LogOut,
  MapPin,
  Sparkles,
  Star,
  Coffee,
  Compass,
  Trophy,
  PartyPopper,
  Calendar,
  Wallet,
  Bell,
  Search,
  ChevronRight,
  Navigation,
  ShieldCheck,
  X,
  CreditCard,
} from "lucide-react";
import categoryData from "../../lib/data/categories.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Map JSON icon strings to actual Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Coffee,
  Compass,
  Trophy,
  PartyPopper,
};

const CATEGORIES = categoryData.map((c) => ({
  ...c,
  icon: ICON_MAP[c.icon] || Sparkles,
}));

// Premium styles for category icons
const CATEGORY_STYLES: Record<string, { textColor: string, shadowColor: string, glowColor: string }> = {
  coffee_date: { textColor: "text-amber-400", shadowColor: "drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]", glowColor: "bg-amber-500/20" },
  explorer: { textColor: "text-cyan-400", shadowColor: "drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]", glowColor: "bg-cyan-500/20" },
  sports_partner: { textColor: "text-emerald-400", shadowColor: "drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]", glowColor: "bg-emerald-500/20" },
  events: { textColor: "text-fuchsia-400", shadowColor: "drop-shadow-[0_0_15px_rgba(232,121,249,0.6)]", glowColor: "bg-fuchsia-500/20" },
};

// Mock popular packages with fixed working image URLs
const POPULAR_PACKAGES = [
  {
    id: "pkg_1",
    title: "Mumbai Midnight Drive",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80",
    price: "₹2,000",
    duration: "3H",
    rating: 4.9,
    reviews: 124,
    category: "City Explorer",
  },
  {
    id: "pkg_2",
    title: "Colaba Heritage Walk",
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&auto=format&fit=crop&q=80",
    price: "₹1,500",
    duration: "2H",
    rating: 4.8,
    reviews: 89,
    category: "City Explorer",
  },
  {
    id: "pkg_3",
    title: "Fine Dining at Taj",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
    price: "₹3,500",
    duration: "4H",
    rating: 5.0,
    reviews: 210,
    category: "Dinner Companion",
  },
  {
    id: "pkg_4",
    title: "Sunday Tennis Partner",
    image: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&auto=format&fit=crop&q=80",
    price: "₹1,000",
    duration: "2H",
    rating: 4.7,
    reviews: 45,
    category: "Sports Buddy",
  },
];

export default function UserHomePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [activeHosts, setActiveHosts] = useState<HostProfile[]>([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(true);
  
  // Pricing Modal State
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [canSkipPricing, setCanSkipPricing] = useState(true);
  const [userBalance, setUserBalance] = useState<any>(null);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const hosts = await HostAPI.getActiveHosts();
        setActiveHosts(hosts);
      } catch (err) {
        console.error("Failed to fetch active hosts:", err);
      } finally {
        setIsLoadingHosts(false);
      }
    };

    const checkServicePlan = async () => {
      if (!user) return;
      try {
        const res = await PricingAPI.getMyBalance();
        const balance = res.data;
        setUserBalance(balance);
        if (!balance || (balance.hoursBalance === 0 && balance.kmBalance === 0)) {
          // Show popup instead of redirecting
          setCanSkipPricing(true);
          setShowPricingModal(true);
        }
      } catch (err) {
        console.error("Failed to check wallet:", err);
      }
    };

    if (user) {
      checkServicePlan();
    }
    fetchHosts();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleBookNow = (pkgId: string) => {
    if (!userBalance || (userBalance.hoursBalance === 0 && userBalance.kmBalance === 0)) {
      setCanSkipPricing(false);
      // Instead of showing the modal on home page, send them to pricing with pkgId
      router.push(`/pricing?pkgId=${pkgId}`);
    } else {
      router.push(`/packages/${pkgId}`);
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

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";
  const userCity = user?.city || "Mumbai";

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-outfit relative overflow-hidden pb-24 md:pb-0">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0C4CD9]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-[#9B51E0]/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#07090E]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer group select-none">
            <Image
              src="/PlusOnne%20Logo%20PNG.png"
              alt="PlusOnne Logo"
              width={42}
              height={42}
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(12,76,217,0.5)] group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2 hidden sm:flex">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
                PlusOnne
              </span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search hosts, packages, or categories..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0C4CD9]/50 transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs cursor-pointer hover:bg-white/10 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#0C4CD9]" />
              <span className="text-slate-300 font-medium truncate max-w-[120px]">{userCity}</span>
            </div>
            <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative shrink-0">
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#0C4CD9] to-[#9B51E0] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold text-white hidden sm:block truncate max-w-[100px]">{displayName}</span>
            </div>
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-4">
              <button onClick={() => router.push("/bookings")} className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">Bookings</button>
              <button onClick={() => router.push("/pricing")} className="text-sm font-medium text-amber-400 hover:text-amber-300 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"><Wallet className="w-4 h-4"/> Upgrade / Wallet</button>
              <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10 relative">
        
        {/* Mobile Search - Hidden on Desktop */}
        <div className="md:hidden relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search hosts, packages..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0C4CD9]/50 transition-colors shadow-inner"
          />
        </div>

        {/* Hero Banner Area */}
        <div className="mb-10 sm:mb-12">
          <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px] rounded-3xl overflow-hidden relative group">
            <Image 
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1600&auto=format&fit=crop&q=80" 
              alt="Hero Premium Booking" 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-[#0C4CD9] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg mb-3 sm:mb-4 w-max shadow-lg shadow-[#0C4CD9]/40">
                Exclusive Experience
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 max-w-2xl leading-tight">
                Curated Companions for Every Occasion
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6 sm:mb-8 leading-relaxed">
                From insightful city tours to elegant dinner dates, find the perfect PlusOne to elevate your experiences.
              </p>
              <button className="bg-gradient-to-r from-[#0C4CD9] to-[#1C7AFF] hover:from-[#1C7AFF] hover:to-[#0C4CD9] text-white font-bold text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-xl w-max transition-all shadow-lg shadow-[#0C4CD9]/30 flex items-center gap-2 group/btn">
                Explore Now
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Categories Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2 flex items-center gap-2">
                Explore Categories <Sparkles className="w-5 h-5 text-purple-400" fill="currentColor" strokeWidth={1} />
              </h2>
              <p className="text-sm text-slate-400">Premium experiences tailored for you</p>
            </div>
            <button className="text-sm font-semibold text-[#0098FF] hover:text-white transition-colors">See All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => {
              const style = CATEGORY_STYLES[cat.id] || { textColor: "text-white", shadowColor: "drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]", glowColor: "bg-white/10" };
              return (
              <div
                key={cat.id}
                onClick={() => router.push(`/packages?category=${cat.id}`)}
                className="group relative overflow-hidden bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.2] rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[220px]"
              >
                {/* Background gradient hint */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl ${cat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Premium Glowing Icon Container */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[24px] bg-gradient-to-br ${cat.color} p-[1px] shadow-xl mb-5 sm:mb-6 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 relative`}>
                    {/* Outer glow on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} rounded-[24px] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                    
                    <div className="w-full h-full bg-gradient-to-br from-[#0A0E17] to-[#131A2B] rounded-[15px] sm:rounded-[23px] flex items-center justify-center relative overflow-hidden shadow-inner">
                      {/* Inner ambient glow matching the icon color */}
                      <div className={`absolute inset-0 ${style.glowColor} opacity-40 group-hover:opacity-70 blur-md transition-opacity duration-500`} />
                      
                      {/* The crisp, neon-style outline icon */}
                      <cat.icon 
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${style.textColor} ${style.shadowColor} relative z-10 transition-transform duration-500 group-hover:scale-110`} 
                        strokeWidth={1.5} 
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">{cat.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">{cat.desc}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 relative z-10">
                  <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">{cat.rate}</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* Active Hosts Nearby Section */}
        <div className="mb-12 sm:mb-16 relative">
          {/* Subtle background glow for this section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-[#0098FF]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex items-end justify-between mb-6 sm:mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="absolute w-full h-full bg-emerald-500/30 rounded-full animate-ping" />
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Hosts Nearby</h2>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" /> Around {userCity}
              </p>
            </div>
            <button className="text-sm font-semibold text-[#0098FF] hover:text-white transition-colors">See Map</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {isLoadingHosts ? (
              <div className="col-span-full py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#0098FF] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-400 text-sm">Discovering hosts near you...</span>
              </div>
            ) : activeHosts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 font-medium">No active hosts nearby right now. Check back later!</div>
            ) : activeHosts.map((host) => (
              <div key={host.hostId} className="bg-white/[0.03] border border-white/[0.08] hover:border-[#0098FF]/40 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#0C4CD9] to-[#9B51E0] group-hover:rotate-12 transition-transform duration-500">
                    {host.avatarUrl ? (
                      <img src={host.avatarUrl} alt={host.displayName} className="w-full h-full rounded-full object-cover border-2 border-[#07090E]" />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-[#07090E] bg-slate-800 flex items-center justify-center font-bold text-white text-xl">
                        {host.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#07090E] w-5 h-5 rounded-full flex items-center justify-center" title="Verified Host">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#0098FF] transition-colors">{host.displayName}</h4>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{host.rating > 0 ? host.rating : "New"}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-3 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> {host.city || "Nearby"}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-auto w-full">
                  {(host.categories || []).slice(0, 2).map(tag => {
                    const categoryObj = categoryData.find(c => c.id === tag);
                    return (
                      <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-slate-300">
                        {categoryObj?.name || tag.replace('_', ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Packages Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2">Trending Packages</h2>
              <p className="text-sm text-slate-400">Most booked experiences this week</p>
            </div>
            <button className="text-sm font-semibold text-[#0098FF] hover:text-white transition-colors">View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => router.push(`/packages/${pkg.id}`)}
                className="bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.15] rounded-3xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl flex flex-col"
              >
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <Image 
                    src={pkg.image} 
                    alt={pkg.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white">
                    {pkg.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-white">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#0098FF] transition-colors">{pkg.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {pkg.duration}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {userCity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Starting from</p>
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {pkg.price}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookNow(pkg.id);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Mobile Floating Nav (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#131926]/95 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3.5 shadow-2xl flex items-center justify-between z-50">
        <button className="flex flex-col items-center gap-1 text-[#0C4CD9]">
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-bold">Explore</span>
        </button>
        <button onClick={() => router.push("/bookings")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold">Bookings</span>
        </button>
        <button onClick={() => router.push("/pricing")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors">
          <Wallet className="w-5 h-5" />
          <span className="text-[9px] font-bold">Wallet</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold">Logout</span>
        </button>
      </nav>

      {/* Pricing Promo / Requirement Modal */}
      <Dialog open={showPricingModal} onOpenChange={(open) => {
        if (!open && !canSkipPricing) return; // Prevent closing if they cannot skip
        setShowPricingModal(open);
      }}>
        <DialogContent className="bg-[#07090E] border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] shadow-[0_0_50px_rgba(12,76,217,0.3)]">
          {canSkipPricing && (
            <button 
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0C4CD9]/30 to-[#9B51E0]/30" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />
            
            <div className="relative p-8 pt-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0C4CD9] to-[#1C7AFF] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(12,76,217,0.6)]">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                {canSkipPricing ? "Elevate Your Experience" : "Service Model Required"}
              </h3>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto mb-8">
                {canSkipPricing 
                  ? "Unlock unlimited access with a subscription or add units to your wallet for pay-per-use bookings." 
                  : "To book this package, you need to select a subscription plan or add units to your pay-per-use wallet."}
              </p>

              <div className="w-full space-y-3">
                <Button 
                  onClick={() => router.push("/pricing")}
                  className="w-full bg-white hover:bg-slate-200 text-black font-black py-6 rounded-2xl text-base shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {canSkipPricing ? "View Pricing & Plans" : "Choose Model to Book"}
                </Button>
                
                {canSkipPricing && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPricingModal(false)}
                    className="w-full text-slate-400 hover:text-white hover:bg-white/5 font-bold py-6 rounded-2xl"
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

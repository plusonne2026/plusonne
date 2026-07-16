"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight, Star, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between font-outfit relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#0C4CD9]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-[#9B51E0]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/PlusOnne%20Logo%20PNG.png"
            alt="PlusOnne Logo"
            width={46}
            height={46}
            priority
            className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(12,76,217,0.5)]"
          />
          <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
            PlusOnne
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-bold transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] hover:opacity-95 text-white text-sm font-extrabold shadow-xl shadow-[#0098FF]/25 transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center z-10 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0098FF]/10 border border-[#0098FF]/20 text-[#0098FF] text-xs sm:text-sm font-bold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>India’s First Verified Companionship Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl text-white">
          Elevate Your Social Life. <br />
          <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
            Verified & Curated Companions.
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Whether you need an explorer for city tours, a coffee date, a sports partner, or an event companion, PlusOnne connects you instantly with verified, respectful hosts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-[#0098FF]/30 hover:scale-105 transition-all"
          >
            <span>Book Your Companion Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl w-full text-left">
          <div className="p-6 rounded-2xl bg-[#0D111A]/85 border border-white/[0.08] backdrop-blur-md">
            <Star className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Strict KYC & AI Checks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every host undergoes government ID verification and background reviews for absolute peace of mind.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A]/85 border border-white/[0.08] backdrop-blur-md">
            <Heart className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Flexible Pricing Models</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose from monthly subscription plans, pay-per-use units, or fixed-price curated packages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A]/85 border border-white/[0.08] backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Real-Time SOS & Safety</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live session tracking with instant emergency dispatch buttons and dedicated support.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-medium z-10">
        <div>© 2026 PlusOnne India Pvt. Ltd. All rights reserved.</div>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-300 cursor-pointer">Safety Guidelines</span>
        </div>
      </footer>
    </div>
  );
}

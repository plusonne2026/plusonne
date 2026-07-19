"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowRight, Star, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            PlusOnne
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-sm font-semibold transition-all hover:border-slate-600"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center z-10 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>India’s First Verified Companionship Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl">
          Elevate Your Social Life. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Verified & Curated Companions.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Whether you need an explorer for city tours, a coffee date, a sports partner, or an event companion, PlusOnne connects you instantly with verified, respectful hosts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
          >
            <span>Book Your Companion Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl w-full text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Star className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">Strict KYC & AI Checks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every host undergoes government ID verification and background reviews for absolute peace of mind.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Heart className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">Flexible Pricing Models</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from monthly subscription plans, pay-per-use units, or fixed-price curated packages.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">Real-Time SOS & Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live session tracking with instant emergency dispatch buttons and dedicated support.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10">
        <div>© 2026 PlusOnne India Pvt. Ltd. All rights reserved.</div>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Safety Guidelines</span>
        </div>
      </footer>
    </div>
  );
}

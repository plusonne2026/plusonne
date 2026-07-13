"use client";

import React from "react";
import Navbar from "./navbar";

export default function LandingHome() {
  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 selection:bg-rose-500 selection:text-white">
      {/* Responsive Sleek Dark Navbar */}
      <Navbar />

      {/* Landing Page Content Preview */}
      <main className="relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-purple-600/15 via-rose-500/15 to-blue-500/15 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-zinc-300 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>PlusOnne Experience Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Elevate Your Celebrations with{" "}
            <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
              PlusOnne
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover curated categories, premium packages, and verified hosts for extraordinary moments across India.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#packages"
              className="px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] shadow-xl shadow-rose-500/20 hover:opacity-95 transition-all hover:scale-105"
            >
              Explore Packages
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-full text-sm font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-all"
            >
              How It Works
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

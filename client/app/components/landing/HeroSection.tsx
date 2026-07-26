"use client";

import React from "react";
import {
  RiVerifiedBadgeFill,
  RiStarFill,
  RiTeamFill,
  RiMagicFill,
  RiShieldCheckFill,
  RiArrowRightLine,
} from "@remixicon/react";

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-rose-500/20 to-blue-500/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Experience Platform Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-zinc-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
          <span>India's #1 Vetted Companion Experience Platform</span>
          <span className="text-zinc-500">|</span>
          <span className="text-orange-300 font-semibold flex items-center gap-1">
            <RiVerifiedBadgeFill className="w-4 h-4 text-orange-400" />
            <span>DigiLocker Verified</span>
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] font-outfit">
          Elevate Your Everyday Moments & Events with{" "}
          <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
            PlusOnne
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Combatting urban loneliness for corporate professionals, students, & seniors. Connect with trained, background-checked hosts for coffee dates, city tours, gym sessions, or formal gala +1 events.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#packages"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] shadow-xl shadow-rose-500/25 hover:opacity-95 transition-all hover:scale-105"
          >
            <span>Explore Packages & Pricing</span>
            <RiArrowRightLine className="w-4 h-4" />
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full text-sm font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-all hover:scale-105"
          >
            How It Works
          </a>
          <a
            href="/host/apply"
            className="px-6 py-4 rounded-full text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <RiMagicFill className="w-4 h-4 text-amber-400" />
            <span>Become a Host (Earn ₹30k/mo)</span>
          </a>
        </div>

        {/* Live Trust Metrics Strip */}
        <div className="mt-16 pt-10 border-t border-white/[0.08] max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              <RiTeamFill className="w-6 h-6 text-blue-400" />
              <span>100+</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium">DigiLocker Verified Hosts</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-extrabold text-amber-400 font-outfit">
              <RiStarFill className="w-6 h-6 text-amber-400" />
              <span>4.95 ★</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium">Average Guest Rating</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-extrabold text-cyan-400 font-outfit">
              <RiMagicFill className="w-6 h-6 text-cyan-400" />
              <span>50+</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium">Daily Completed Services</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-extrabold text-emerald-400 font-outfit">
              <RiShieldCheckFill className="w-6 h-6 text-emerald-400" />
              <span>100%</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium">SOS Safety Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}

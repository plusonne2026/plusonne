"use client";

import React from "react";
import Link from "next/link";
import {
  RiSearchEyeFill,
  RiUserSearchFill,
  RiShieldKeyholeFill,
  RiEmotionHappyFill,
  RiShieldCheckFill,
  RiArrowRightSLine,
} from "@remixicon/react";

const STEPS = [
  {
    step: "01",
    title: "Select Category & City",
    description:
      "Choose from curated experiences — coffee dates, city walks, gym partners, gala +1s, or senior care.",
    badge: "Step 1",
    icon: <RiSearchEyeFill className="w-6 h-6 text-orange-400" />,
  },
  {
    step: "02",
    title: "Pick Your Verified Host",
    description:
      "Browse 100% DigiLocker-verified, background-checked hosts with real ratings, video intros, & bios.",
    badge: "Step 2",
    icon: <RiUserSearchFill className="w-6 h-6 text-pink-400" />,
  },
  {
    step: "03",
    title: "Instant OTP & Live Location",
    description:
      "Confirm your session unit or pass. Unlock live GPS tracking, live face matching, and secure OTP verification.",
    badge: "Step 3",
    icon: <RiShieldKeyholeFill className="w-6 h-6 text-purple-400" />,
  },
  {
    step: "04",
    title: "Enjoy & Rate Experience",
    description:
      "Meet safely in public venues. Enjoy memorable company with 24/7 SOS security shield active on your app.",
    badge: "Step 4",
    icon: <RiEmotionHappyFill className="w-6 h-6 text-cyan-400" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-[#090C16] overflow-hidden border-t border-white/[0.06]"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs sm:text-sm font-semibold text-purple-400 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>4-Step Seamless Journey</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-outfit">
            How PlusOnne Works for{" "}
            <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
              You
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Booking a companion is fast, transparent, and protected by end-to-end identity verification and on-ground safety protocols.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className="group relative rounded-3xl bg-[#101322]/90 border border-white/[0.08] hover:border-white/20 p-8 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Step badge & icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-extrabold text-white/15 group-hover:text-white/30 transition-colors font-outfit">
                    {item.step}
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/10 mb-3 inline-block">
                  {item.badge}
                </span>

                <h3 className="text-xl font-bold text-white mt-2 group-hover:text-pink-300 transition-colors font-outfit">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Progress connector indicator */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-white/20">
                  <RiArrowRightSLine className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Banner Below Timeline */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-[#121526] via-[#1A1D33] to-[#121526] border border-white/10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
              <RiShieldCheckFill className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-outfit">
                100% Safety & Verification Shield
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Every Host passes DigiLocker KYC, video interviews, background checks, & live face matching before service start.
              </p>
            </div>
          </div>

          <Link
            href="/help"
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 shrink-0 transition-all"
          >
            Learn About Safety
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";

export default function BecomeHostSection() {
  return (
    <section id="become-a-host" className="relative py-24 bg-[#080A10] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-10 w-[500px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-rose-500/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Information & Earnings Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm font-semibold text-amber-400 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Become a PlusOnne Founding Host</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-outfit leading-tight">
              Turn Your Time into Purpose & Earn Up to{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                ₹30,000 / Month
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Join India's premiere companion network. Escort guests to coffee dates, city tours, gym sessions, and formal galas while enjoying top-tier safety, flexible hours, and professional NGO training.
            </p>

            {/* Earnings & Split Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#121524] border border-white/10">
                <div className="text-2xl font-extrabold text-amber-400 font-outfit">70 / 30</div>
                <div className="text-xs font-semibold text-white mt-1">Host Revenue Split</div>
                <p className="text-[11px] text-zinc-400 mt-1">You keep 70% of every base service & distance fee.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121524] border border-white/10">
                <div className="text-2xl font-extrabold text-orange-400 font-outfit">₹10,000</div>
                <div className="text-xs font-semibold text-white mt-1">Guaranteed Base</div>
                <p className="text-[11px] text-zinc-400 mt-1">Fixed monthly base salary for 10 minimum completed services.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121524] border border-white/10">
                <div className="text-2xl font-extrabold text-rose-400 font-outfit">NGO Certified</div>
                <div className="text-xs font-semibold text-white mt-1">Free Soft Skills Training</div>
                <p className="text-[11px] text-zinc-400 mt-1">Professional etiquette, communication, & safety training.</p>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span><strong>Flexible Scheduling:</strong> Pick the dates, hours, & categories you want to host.</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span><strong>Growth Track to Team Manager:</strong> High performing hosts get promoted to Team Managers with ₹30,000/mo fixed salary.</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span><strong>24/7 Safety Dispatch:</strong> Dedicated SOS button and live emergency response team.</span>
              </div>
            </div>

            {/* Host Application CTA Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="/host/apply"
                className="px-8 py-4 rounded-full text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:opacity-95 shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
              >
                Apply to Become a Host
              </a>
              <a
                href="#help"
                className="px-6 py-4 rounded-full text-sm font-semibold text-zinc-300 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-all"
              >
                Host Hiring FAQs
              </a>
            </div>
          </div>

          {/* Right Column: Host Preview Card Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#181C2E] via-[#121524] to-[#0A0D18] border border-white/10 p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20 text-amber-400">
                <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>

              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-6">
                HOST EARNING CALCULATOR
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-sm">
                  <span className="text-zinc-400">Base Companion Rate (1 Hr + 10 km)</span>
                  <span className="text-white font-bold">₹1,000</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-sm">
                  <span className="text-zinc-400">Your Host Cut (70%)</span>
                  <span className="text-emerald-400 font-bold">₹700 / service</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-sm">
                  <span className="text-zinc-400">Services Completed (e.g. 25/mo)</span>
                  <span className="text-white font-bold">25 Services</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mt-6 text-center">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">Estimated Monthly Take-Home</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block font-outfit">₹27,500 / month</span>
                  <span className="text-[11px] text-zinc-400 mt-1 block">Includes base stipend + 70% commission earnings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";

interface Plan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  highlight: string;
}

const PLANS: Plan[] = [
  {
    id: "unit",
    name: "One-Time Unit",
    badge: "Pay-As-You-Go",
    price: "₹1,000",
    period: "per service unit",
    description: "Perfect for single coffee dates, city walks, or trying out PlusOnne for the first time.",
    features: [
      "Up to 1 hour of host companion time",
      "Covers up to 10 km travel included",
      "DigiLocker verified host guarantee",
      "Live SOS safety tracking enabled",
      "Standard host matching",
    ],
    ctaText: "Book Single Experience",
    highlight: "Ideal for first-timers & quick meetups",
  },
  {
    id: "package",
    name: "Bulk Experience Pass",
    badge: "Best Value",
    popular: true,
    price: "₹10,000",
    period: "10 Service Credits",
    description: "Great for frequent socializers, commuters, or weekend travelers who need companions.",
    features: [
      "10 Full Service Units included (₹1,000/unit)",
      "Covers up to 100 km cumulative travel",
      "Valid for 90 days across all categories",
      "Flexible schedule with 2-hour advance booking",
      "Dedicated account manager support",
      "No peak pricing surge charges",
    ],
    ctaText: "Get 10-Pass Bundle",
    highlight: "Save on multiple experiences",
  },
  {
    id: "subscription",
    name: "VIP Monthly Membership",
    badge: "All Access Pass",
    price: "₹10,000",
    period: "per month",
    description: "Designed for corporate professionals and expats seeking regular weekend companionship.",
    features: [
      "Covers 2 Full Weekend Experiences",
      "20% OFF all extra distance & minute charges",
      "Top-Rated VIP Host Priority Matching",
      "Free 100% cancellation up to 1 hour before",
      "Dedicated 24/7 SOS Security Escort",
      "Exclusive invitations to PlusOnne Galas",
    ],
    ctaText: "Join VIP Membership",
    highlight: "Maximum flexibility & 20% overage discount",
  },
];

export default function PackagesSection() {
  const [billingCycle, setBillingCycle] = useState<"standard" | "annual">("standard");

  return (
    <section id="packages" className="relative py-24 bg-[#080A10] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-gradient-to-l from-rose-500/10 via-purple-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm font-semibold text-rose-400 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>Transparent Pricing Models</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-outfit">
            Flexible Packages Tailored to Your{" "}
            <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
              Lifestyle
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            No hidden costs. Choose between flexible one-time unit bookings, discounted multi-pass bundles, or full VIP monthly memberships.
          </p>
        </div>

        {/* Billing Toggle (Standard vs Annual discount callout) */}
        <div className="mt-10 flex items-center justify-center">
          <div className="p-1 rounded-full bg-[#121522] border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBillingCycle("standard")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === "standard"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Standard Rates
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>VIP Pass</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/20 font-bold">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                plan.popular
                  ? "bg-gradient-to-b from-[#181C2E] via-[#121524] to-[#0D101C] border-2 border-rose-500/50 shadow-2xl shadow-rose-500/10 lg:-translate-y-3"
                  : "bg-[#10131F]/90 border border-white/[0.08] hover:border-white/20"
              }`}
            >
              {/* Popular Badge header */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF6A3D] to-[#FF4E6E] text-white text-xs font-bold shadow-lg shadow-rose-500/30 uppercase tracking-wider">
                  ⭐ Most Popular Choice
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white font-outfit">{plan.name}</h3>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-zinc-300 border border-white/10">
                    {plan.badge}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 min-h-[40px] mb-6">{plan.description}</p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit">
                    {plan.price}
                  </span>
                  <span className="text-sm text-zinc-400 font-medium">{plan.period}</span>
                </div>

                <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-amber-300 mb-8 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>{plan.highlight}</span>
                </div>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    What's Included:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-xl ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] text-white hover:opacity-95 hover:scale-[1.02] shadow-rose-500/20"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-white/30"
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

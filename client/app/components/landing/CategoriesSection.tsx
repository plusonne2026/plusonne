"use client";

import React, { useState } from "react";

interface Category {
  id: string;
  title: string;
  badge: string;
  description: string;
  price: string;
  rating: string;
  hostsCount: string;
  icon: React.ReactNode;
  tags: string[];
  gradient: string;
}

const CATEGORIES: Category[] = [
  {
    id: "coffee",
    title: "Coffee & Conversation",
    badge: "Most Popular",
    description:
      "Connect with friendly, articulate companions for meaningful chats over coffee, tea, or quiet lounge meetups.",
    price: "₹499 / session",
    rating: "4.95 ★",
    hostsCount: "50+ Active Hosts",
    tags: ["Relaxed", "Deep Talks", "Networking"],
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" />
        <line x1="10" x2="10" y1="2" y2="4" />
        <line x1="14" x2="14" y1="2" y2="4" />
      </svg>
    ),
  },
  {
    id: "explorer",
    title: "City Explorer & Guide",
    badge: "Trending",
    description:
      "Uncover hidden gems, food street walks, shopping markets, and iconic monuments with a knowledgeable local.",
    price: "₹999 / tour",
    rating: "4.92 ★",
    hostsCount: "65+ Active Hosts",
    tags: ["Sightseeing", "Food Walks", "Local Insider"],
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    id: "event",
    title: "Event & Party Companion (+1)",
    badge: "VIP Choice",
    description:
      "Never attend galas, corporate dinners, weddings, or concerts alone. Hire an elegant, courteous +1 companion.",
    price: "₹1,499 / event",
    rating: "4.98 ★",
    hostsCount: "35+ Active Hosts",
    tags: ["Plus-One", "Social Events", "Formal Galas"],
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.8 11.3 2 22l10.7-3.79" />
        <path d="M4 3h.01" />
        <path d="M22 8h.01" />
        <path d="M15 2h.01" />
        <path d="M22 20h.01" />
        <path d="m22 2-2.24 3.25a3 3 0 0 0 .44 3.97l2.25 1.83" />
      </svg>
    ),
  },
  {
    id: "sports",
    title: "Sports & Fitness Partner",
    badge: "Active",
    description:
      "Stay motivated! Hire a badminton rival, tennis buddy, gym motivator, or morning jogging partner.",
    price: "₹799 / session",
    rating: "4.89 ★",
    hostsCount: "40+ Active Hosts",
    tags: ["Fitness", "Badminton", "Gym Buddy"],
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M12 6v12" />
      </svg>
    ),
  },
  {
    id: "elder",
    title: "Senior Care & Warm Company",
    badge: "Care Shield",
    description:
      "Compassionate companions for elderly parents or housebound relatives — doctor visits, grocery runs, & stories.",
    price: "₹899 / visit",
    rating: "4.99 ★",
    hostsCount: "30+ Active Hosts",
    tags: ["Compassionate", "Doctor Escort", "Patient"],
    gradient: "from-rose-500/20 via-orange-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: "study",
    title: "Co-Working & Study Buddy",
    badge: "Focus Mode",
    description:
      "Boost your productivity at cafes or libraries with a disciplined focus partner to keep accountability high.",
    price: "₹599 / session",
    rating: "4.91 ★",
    hostsCount: "45+ Active Hosts",
    tags: ["Productivity", "Library", "Remote Work"],
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
    icon: (
      <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  },
];

export default function CategoriesSection() {
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const tags = ["All", "Relaxed", "Sightseeing", "Plus-One", "Fitness", "Compassionate", "Productivity"];

  const filteredCategories =
    selectedTag === "All"
      ? CATEGORIES
      : CATEGORIES.filter((cat) => cat.tags.includes(selectedTag));

  return (
    <section id="categories" className="relative py-24 bg-[#080A10] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm font-semibold text-blue-400 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Vetted Experience Categories</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-outfit">
            Find the Perfect Companion for{" "}
            <span className="bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
              Every Occasion
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            From casual coffee chats to formal gala +1s, discover verified hosts trained to provide safe, engaging, and memorable experiences.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                selectedTag === tag
                  ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10 scale-105"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-3xl bg-[#10131F]/90 border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden"
            >
              {/* Background card gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              <div>
                {/* Header row: Icon + Badge */}
                <div className="flex items-center justify-between gap-4 mb-5 relative z-10">
                  <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/10 backdrop-blur-md">
                    {cat.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-outfit">
                  {cat.title}
                </h3>
                <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                  {cat.description}
                </p>

                {/* Tag Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.05]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Rating, Hosts, Price & CTA */}
              <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                    <span>{cat.rating}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 font-normal">{cat.hostsCount}</span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {cat.price}
                  </div>
                </div>

                <a
                  href="#packages"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all group-hover:border-blue-400/40"
                >
                  <span>Book Now</span>
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

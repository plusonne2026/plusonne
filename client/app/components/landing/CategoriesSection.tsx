"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RiCupFill,
  RiCompass4Fill,
  RiVipCrown2Fill,
  RiRunFill,
  RiHeart3Fill,
  RiMacbookFill,
  RiStarFill,
  RiArrowRightLine,
} from "@remixicon/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    icon: <RiCupFill className="w-6 h-6 text-amber-400" />,
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
    icon: <RiCompass4Fill className="w-6 h-6 text-cyan-400" />,
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
    icon: <RiVipCrown2Fill className="w-6 h-6 text-purple-400" />,
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
    icon: <RiRunFill className="w-6 h-6 text-emerald-400" />,
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
    icon: <RiHeart3Fill className="w-6 h-6 text-rose-400" />,
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
    icon: <RiMacbookFill className="w-6 h-6 text-indigo-400" />,
  },
];

export default function CategoriesSection() {
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const tags = [
    "All",
    "Relaxed",
    "Sightseeing",
    "Plus-One",
    "Fitness",
    "Compassionate",
    "Productivity",
  ];

  const filteredCategories =
    selectedTag === "All"
      ? CATEGORIES
      : CATEGORIES.filter((cat) => cat.tags.includes(selectedTag));

  return (
    <section
      id="categories"
      className="relative py-24 bg-[#080A10] overflow-hidden border-t border-white/[0.06]"
    >
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
            Swipe or scroll through our curated categories of verified hosts trained to provide safe, engaging, and memorable experiences.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${selectedTag === tag
                ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10 scale-105"
                : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Interactive Embla Carousel */}
        <div className="mt-14 relative px-4 sm:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {filteredCategories.map((cat) => (
                <CarouselItem
                  key={cat.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <div className="group relative rounded-3xl bg-[#10131F]/90 border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden h-full min-h-[380px]">
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
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                          <RiStarFill className="w-3.5 h-3.5 text-amber-400" />
                          <span>{cat.rating}</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400 font-normal">
                            {cat.hostsCount}
                          </span>
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                          {cat.price}
                        </div>
                      </div>

                      <Link
                        href="/packages"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all group-hover:border-blue-400/40"
                      >
                        <span>Book Now</span>
                        <RiArrowRightLine className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <CarouselPrevious className="-left-4 sm:-left-6 bg-[#121524] hover:bg-[#1A1E32] text-white border-white/15 hover:border-white/30" />
            <CarouselNext className="-right-4 sm:-right-6 bg-[#121524] hover:bg-[#1A1E32] text-white border-white/15 hover:border-white/30" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

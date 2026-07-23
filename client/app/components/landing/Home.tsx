"use client";

import React from "react";
import Navbar from "./navbar";
import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import PackagesSection from "./PackagesSection";
import HowItWorksSection from "./HowItWorksSection";
import BecomeHostSection from "./BecomeHostSection";
import HelpSection from "./HelpSection";
import Footer from "./Footer";

export default function LandingHome() {
  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 selection:bg-rose-500 selection:text-white font-sans scroll-smooth">
      {/* Sticky Sleek Navbar */}
      <Navbar />

      {/* Main Landing Content Container containing all tab sections */}
      <main className="relative">
        {/* 1. Home / Hero Tab */}
        <HeroSection />

        {/* 2. Categories Tab */}
        <CategoriesSection />

        {/* 3. Packages & Pricing Tab */}
        <PackagesSection />

        {/* 4. How It Works Tab */}
        <HowItWorksSection />

        {/* 5. Become a Host Tab */}
        <BecomeHostSection />

        {/* 6. Help & Safety FAQs Tab */}
        <HelpSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

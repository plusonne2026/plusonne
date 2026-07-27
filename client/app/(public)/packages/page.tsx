"use client";

import React from "react";
import Navbar from "@/app/components/landing/navbar";
import PackagesSection from "@/app/components/landing/PackagesSection";
import Footer from "@/app/components/landing/Footer";

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 selection:bg-rose-500 selection:text-white font-sans">
      <Navbar />
      <main className="relative pt-6">
        <PackagesSection />
      </main>
      <Footer />
    </div>
  );
}

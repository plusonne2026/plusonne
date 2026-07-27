"use client";

import React from "react";
import Navbar from "@/app/components/landing/navbar";
import HelpSection from "@/app/components/landing/HelpSection";
import Footer from "@/app/components/landing/Footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 selection:bg-rose-500 selection:text-white font-sans">
      <Navbar />
      <main className="relative pt-6">
        <HelpSection />
      </main>
      <Footer />
    </div>
  );
}

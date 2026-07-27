"use client";

import React from "react";
import Navbar from "@/app/components/landing/navbar";
import CategoriesSection from "@/app/components/landing/CategoriesSection";
import Footer from "@/app/components/landing/Footer";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#080A10] text-zinc-100 selection:bg-rose-500 selection:text-white font-sans">
      <Navbar />
      <main className="relative pt-6">
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}

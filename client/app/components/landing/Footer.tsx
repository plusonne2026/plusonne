"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#06080E] text-zinc-400 border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/PlusOnne%20Logo%20PNG.png"
                alt="PlusOnne Logo"
                width={36}
                height={36}
                className="h-8 w-auto object-contain"
              />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent font-outfit">
                PlusOnne
              </span>
            </Link>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              India's premier companion experience platform. Combating urban loneliness through verified hosts, DigiLocker KYC, and transparent pricing.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ DigiLocker Verified
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                🛡️ 24/7 SOS Shield
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-outfit mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-white transition-colors">
                  Packages & Pricing
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#become-a-host" className="hover:text-white transition-colors">
                  Become a Host
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-outfit mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Coffee & Chats
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  City Explorer
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Event +1 Companion
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Sports & Gym Buddy
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Senior Care Companion
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-outfit mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#help" className="hover:text-white transition-colors">
                  Safety Protocols
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/host/apply" className="hover:text-white transition-colors">
                  Host Terms & 70/30 Split
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} PlusOnne Experience Platform. All rights reserved.
          </div>
          <div>
            Crafted for Extraordinary Moments across India.
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../lib/context/AuthContext";

// Inline SVGs for zero dependency issues & crisp rendering
const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronDownIcon = ({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MenuIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "#categories" },
  { name: "Packages", href: "#packages" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Become a Host", href: "#become-a-host" },
  { name: "Help", href: "#help" },
];

const CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Goa",
  "Jaipur",
  "Pune",
  "Hyderabad",
  "Kolkata",
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [activeItem, setActiveItem] = useState<string>("Home");
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for header elevation & glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? "bg-[#090B10]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-xl shadow-black/40 py-3.5"
        : "bg-[#090B10]/85 backdrop-blur-md border-b border-white/[0.05] py-4"
        }`}
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <nav className="flex items-center justify-between gap-4">
          {/* Left: Brand Logo + PlusOnne Text with Electric Blue Gradient */}
          <Link
            href="/"
            onClick={() => setActiveItem("Home")}
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="relative flex items-center transition-transform duration-200 group-hover:scale-[1.04]">
              <Image
                src="/PlusOnne%20Logo%20PNG.png"
                alt="PlusOnne Brand Icon"
                width={44}
                height={44}
                priority
                className="h-8 sm:h-9 md:h-10 w-auto object-contain"
              />
            </div>
            <span className="text-2xl sm:text-[26px] md:text-[28px] font-bold tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent select-none font-outfit">
              PlusOnne
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeItem === item.name;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveItem(item.name)}
                  className={`relative py-1.5 text-sm font-medium transition-colors duration-200 ${isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white/85 rounded-full shadow-sm shadow-white/40 transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Location Selector + Auth Action Button */}
          <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0">
            {/* Location Selector Dropdown */}
            <div className="relative" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111420] hover:bg-[#181C2C] border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-inner"
                aria-haspopup="listbox"
                aria-expanded={isCityDropdownOpen}
              >
                <MapPinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                <span>{selectedCity}</span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111420]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Select City
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {CITIES.map((city) => {
                      const isSelected = city === selectedCity;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors ${isSelected
                            ? "bg-white/10 text-white font-medium"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <span>{city}</span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-orange-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Login / Sign Up Gradient CTA Button */}
            <Link
              href="/auth/login"
              className="relative inline-flex items-center justify-center px-5 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] hover:opacity-95 shadow-lg shadow-rose-500/15 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              <span>Login / Sign Up</span>
            </Link>
          </div>

          {/* Mobile Right Controls: Location Pill (mobile) + Hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#111420] border border-white/10 text-zinc-200 text-xs font-medium"
            >
              <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>{selectedCity}</span>
              <ChevronDownIcon className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors lg:hidden focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile City Dropdown (when toggled on mobile) */}
        {isCityDropdownOpen && (
          <div className="sm:hidden mt-3 rounded-2xl bg-[#111420]/95 border border-white/10 p-2 shadow-xl">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Select City
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {CITIES.map((city) => {
                const isSelected = city === selectedCity;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${isSelected
                      ? "bg-white/10 text-white"
                      : "text-zinc-300 hover:bg-white/5"
                      }`}
                  >
                    <span>{city}</span>
                    {isSelected && (
                      <CheckIcon className="w-3.5 h-3.5 text-orange-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 pb-4">
              {NAV_ITEMS.map((item) => {
                const isActive = activeItem === item.name;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setActiveItem(item.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-white/10 px-2">
                <Link
                  href="#login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-5 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] shadow-lg shadow-rose-500/20"
                >
                  Login / Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

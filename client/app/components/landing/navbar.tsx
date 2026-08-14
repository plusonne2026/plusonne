"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import {
  RiMapPinFill,
  RiArrowDownSLine,
  RiMenu3Fill,
  RiCloseFill,
  RiCheckFill,
  RiShieldCheckFill,
  RiCrosshairLine,
  RiLoader4Line,
  RiUser3Line,
  RiCalendarEventLine,
  RiLogoutCircleLine,
  RiDashboardLine
} from "@remixicon/react";

export interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Packages", href: "/package" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Become a Host", href: "/become-a-host" },
  { name: "Help", href: "/help" },
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
  const pathname = usePathname();
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");
  const [isGpsLocation, setIsGpsLocation] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Detect user location via IP address (no browser permission prompt needed)
  const detectUserLocation = useCallback(async () => {
    try {
      // 1. Try ipapi.co
      let res = await fetch("https://ipapi.co/json/").catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const city = data.city || data.region || data.country_name;
        if (city) {
          setSelectedCity(city);
          setIsGpsLocation(false); // It's IP based, not accurate GPS
          return;
        }
      }

      // 2. Fallback to ip-api.com
      res = await fetch("https://ip-api.com/json/").catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const city = data.city || data.regionName;
        if (city) {
          setSelectedCity(city);
          setIsGpsLocation(false);
          return;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Actual GPS Detection (Requires Permission)
  const handleGPSLocation = async () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/geocode/reverse?lat=${lat}&lng=${lng}`
            );
            const res = await response.json();
            if (res.success && res.data && res.data.address) {
              const detectedCity = res.data.address.city || res.data.address.state_district || res.data.address.county || "Detected Location";
              setSelectedCity(detectedCity);
              setIsGpsLocation(true);
              localStorage.setItem(
                "plusonne_user_location",
                JSON.stringify({ city: detectedCity, isGps: true })
              );
            }
          } catch (error) {
            console.error("Geocoding failed", error);
          } finally {
            setIsLocating(false);
            setIsCityDropdownOpen(false);
          }
        },
        (error) => {
          console.error("GPS error", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Sync with User Profile
  useEffect(() => {
    if (user?.city) {
      setSelectedCity(user.city);
      localStorage.setItem(
        "plusonne_user_location",
        JSON.stringify({ city: user.city, isGps: true })
      );
    }
  }, [user?.city]);

  // Initialize saved location or trigger IP location detection on mount
  useEffect(() => {
    if (user?.city) return; // Skip if we have user city
    try {
      const saved = localStorage.getItem("plusonne_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.city) {
          setSelectedCity(parsed.city);
          setIsGpsLocation(!!parsed.isGps);
          return;
        }
      }
    } catch {
      // Ignore JSON parse errors
    }

    // Auto-detect user's actual city via IP on mount
    detectUserLocation();
  }, [detectUserLocation, user?.city]);

  // Handle scroll effect for header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
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
        <nav className="flex items-center justify-between gap-4" aria-label="Main Navigation">
          {/* Left: Brand Logo + PlusOnne Text */}
          <Link
            href="/"
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
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative py-1.5 text-sm font-medium transition-colors duration-200 ${isActive
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-gradient-to-r from-[#FF6A3D] to-[#9B51E0] rounded-full shadow-md shadow-rose-500/40 transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Location Selector Dropdown + Auth Action Button */}
          <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0">
            {/* Location Selector Dropdown (Positioned on the Right as original) */}
            <div className="relative" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111420] hover:bg-[#181C2C] border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-inner"
                aria-haspopup="listbox"
                aria-expanded={isCityDropdownOpen}
              >
                <RiMapPinFill className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="max-w-[130px] sm:max-w-[160px] truncate">
                  {isLocating ? "Locating..." : selectedCity}
                </span>
                <RiArrowDownSLine
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#111420]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Current Location Action */}
                  <div className="px-2 pb-1.5 border-b border-white/10">
                    <button
                      type="button"
                      disabled={isLocating}
                      onClick={handleGPSLocation}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 hover:from-orange-500/20 hover:via-rose-500/20 hover:to-purple-500/20 border border-orange-500/20 text-xs font-semibold text-white transition-all group"
                    >
                      {isLocating ? (
                        <RiLoader4Line className="w-4 h-4 text-orange-400 animate-spin shrink-0" />
                      ) : (
                        <RiCrosshairLine className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                      )}
                      <span className="text-white font-medium">Use Current Location</span>
                    </button>
                  </div>

                  {/* Header Label */}
                  <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Select City</span>
                    <RiShieldCheckFill className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  {/* Manual City Options */}
                  <div className="max-h-56 overflow-y-auto">
                    {CITIES.map((city) => {
                      const isSelected = city === selectedCity;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setIsGpsLocation(false);
                            localStorage.setItem(
                              "plusonne_user_location",
                              JSON.stringify({ city, isGps: false })
                            );
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors ${isSelected
                            ? "bg-white/10 text-white font-medium"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <span>{city}</span>
                          {isSelected && (
                            <RiCheckFill className="w-4 h-4 text-orange-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Login / Auth Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-[#FF6A3D]/50 bg-[#111420] overflow-hidden flex items-center justify-center transition-all"
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <RiUser3Line className="w-5 h-5 text-white" />
                  )}
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-2xl bg-[#111420]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-2 z-50 animate-in slide-in-from-top-2">
                    <div className="px-3 py-3 border-b border-white/5 mb-1">
                      <p className="text-sm font-bold text-white truncate">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Verified User'}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      href={user?.role === "host" ? "/host/dashboard" : "/bookings"}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      {user?.role === "host" ? <RiDashboardLine className="w-4 h-4 text-orange-400" /> : <RiCalendarEventLine className="w-4 h-4 text-orange-400" />}
                      {user?.role === "host" ? "Host Dashboard" : "My Bookings"}
                    </Link>
                    
                    <button
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <RiLogoutCircleLine className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="relative inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] hover:opacity-95 shadow-lg shadow-rose-500/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              >
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#111420] border border-white/10 text-zinc-200 text-xs font-medium"
            >
              <RiMapPinFill className="w-3.5 h-3.5 text-orange-400" />
              <span className="max-w-[80px] truncate">{isLocating ? "Locating..." : selectedCity}</span>
              <RiArrowDownSLine className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors lg:hidden focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <RiCloseFill className="w-5 h-5" />
              ) : (
                <RiMenu3Fill className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 pb-4">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-white/10 px-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-5 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] shadow-lg shadow-rose-500/20"
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

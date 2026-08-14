"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/context/AuthContext";
import { AuthAPI } from "../../../lib/api/auth.api";
import {
  User as UserIcon,
  MapPin,
  Languages,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Camera,
  AlertCircle,
  Navigation,
} from "lucide-react";

const INDIAN_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Ahmedabad",
  "Goa",
  "Chandigarh",
  "Kochi",
];

const AVAILABLE_LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Marathi",
  "Kannada",
  "Bengali",
  "Gujarati",
  "Malayalam",
  "Punjabi",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState<string>("");
  const [city, setCity] = useState<string>("Mumbai");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English", "Hindi"]);
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>("");

  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [detecting, setDetecting] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      if (user.city) setCity(user.city);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      if (user.preferredLanguages?.length) setSelectedLanguages(user.preferredLanguages);
    }
  }, [user, isAuthenticated, isLoading, router]);

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleDetectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/geocode/reverse?lat=${lat}&lng=${lng}`
            );
            const res = await response.json();
            
            if (res.success && res.data && res.data.address) {
              const detectedCity = res.data.address.city || res.data.address.state_district || res.data.address.county || "Detected Location";
              setCity(detectedCity);
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            setCity("GPS Location");
          } finally {
            setDetecting(false);
          }
        },
        (error) => {
          console.error(error);
          setDetecting(false);
        }
      );
    } else {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) {
      setError("Active user session not found. Please log in again.");
      return;
    }

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalAvatar = customAvatarUrl.trim() || avatarUrl;
      const updatedProfile = await AuthAPI.completeProfile(user.userId, {
        displayName: displayName.trim(),
        avatarUrl: finalAvatar,
        city,
        coordinates: coordinates || undefined,
        preferredLanguages: selectedLanguages,
      });

      // Update global context session
      setUser({
        ...user,
        ...updatedProfile,
        isVerified: true,
      });

      router.push("/home");
    } catch (err: any) {
      console.error("Profile completion failed:", err);
      setError(err.message || "Failed to save your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-zinc-300 font-outfit">
        <Loader2 className="w-8 h-8 animate-spin text-[#0098FF] mb-4" />
        <p className="text-sm font-bold tracking-wide">Loading your PlusOnne profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-outfit flex items-center justify-center relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-[#0C4CD9]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#9B51E0]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-3xl w-full bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.8)] p-6 sm:p-12 z-10">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/PlusOnne%20Logo%20PNG.png"
              alt="PlusOnne Logo"
              width={46}
              height={46}
              priority
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(12,76,217,0.5)]"
            />
            <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
              PlusOnne
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0098FF]/10 border border-[#0098FF]/20 text-[#0098FF] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Profile Setup • Step 2 of 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Let’s Personalize Your PlusOnne Experience
          </h1>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
            Choose your current city and preferred languages so we can instantly match you with verified companions nearby.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-fade-in shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold mb-0.5">Profile Update Note</p>
              <p className="text-rose-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Avatar Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#0098FF]" />
              <span>Choose Profile Avatar</span>
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {AVATAR_PRESETS.map((preset, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    setAvatarUrl(preset);
                    setCustomAvatarUrl("");
                  }}
                  className={`relative rounded-full p-1 border-2 transition-all ${
                    avatarUrl === preset && !customAvatarUrl
                      ? "border-[#0098FF] scale-105 shadow-lg shadow-[#0098FF]/30"
                      : "border-white/[0.08] hover:border-white/[0.2] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={preset} alt={`Preset ${index + 1}`} className="w-14 h-14 rounded-full object-cover" />
                  {avatarUrl === preset && !customAvatarUrl && (
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0098FF] border-2 border-[#0D111A] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => {
                  setCustomAvatarUrl(e.target.value);
                  if (e.target.value.trim()) setAvatarUrl(e.target.value);
                }}
                placeholder="Or paste custom image URL (Cloudinary / Unsplash)..."
                className="w-full bg-[#131824] border border-white/[0.08] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-[#0098FF] focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20"
              />
            </div>
          </div>

          {/* Section 2: Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0098FF]" />
              <span>Your Display Name</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="E.g. Rahul Sharma"
              className="w-full bg-[#131824] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:border-[#0098FF] focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20 font-bold transition-all"
              required
            />
          </div>

          {/* Section 3: City Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0098FF]" />
                <span>Select Current City</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="text-xs font-bold text-[#0098FF] hover:text-[#1C7AFF] flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {detecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    Detect My Location
                  </>
                )}
              </button>
            </div>
            
            {/* Display detected city explicitly if not in the common list */}
            {!INDIAN_CITIES.includes(city) && city && (
              <div className="mb-2.5 p-3 rounded-xl bg-[#0098FF]/10 border border-[#0098FF]/30 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{city}</span>
                <span className="text-xs text-[#0098FF]">Detected GPS</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INDIAN_CITIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCity(c)}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                    city === c
                      ? "bg-[#0098FF]/20 border-[#0098FF] text-white shadow-md shadow-[#0098FF]/20"
                      : "bg-[#131824] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.15]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Preferred Languages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#0098FF]" />
              <span>Preferred Languages (Select at least one)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] border-transparent text-white shadow-md shadow-[#0098FF]/25 scale-105"
                        : "bg-[#131824] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.15]"
                    }`}
                  >
                    {isSelected && <span className="mr-1.5">✓</span>}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting || !displayName.trim()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:shadow-[#0098FF]/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Start Exploring</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

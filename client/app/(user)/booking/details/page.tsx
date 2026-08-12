"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Calendar, Clock, Sparkles, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Mock packages (matching pricing page)
const POPULAR_PACKAGES = [
  { id: "pkg_1", title: "Mumbai Midnight Drive", price: 2000, priceStr: "₹2,000", category: "City Explorer" },
  { id: "pkg_2", title: "Colaba Heritage Walk", price: 1500, priceStr: "₹1,500", category: "City Explorer" },
  { id: "pkg_3", title: "Fine Dining at Taj", price: 3500, priceStr: "₹3,500", category: "Dinner Companion" },
  { id: "pkg_4", title: "Sunday Tennis Partner", price: 1000, priceStr: "₹1,000", category: "Sports Buddy" },
];

function BookingDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const pkgId = searchParams.get("pkgId");
  
  const selectedPackage = POPULAR_PACKAGES.find(p => p.id === pkgId);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [detecting, setDetecting] = useState(false);

  const handleDetectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  "Accept-Language": "en"
                }
              }
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            setLocation(`Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          } finally {
            setDetecting(false);
          }
        },
        (error) => {
          toast.error("Failed to get location. Please type it manually.");
          setDetecting(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setDetecting(false);
    }
  };

  const handleConfirm = () => {
    if (!date || !time || !location) {
      toast.warning("Please fill in Date, Time and Pickup Location");
      return;
    }
    
    // Pass booking details to payment page
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (pkgId) params.set("pkgId", pkgId);
    
    router.push(`/booking/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030305] border-b border-white/[0.05] px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Booking Details</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side - Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Schedule your session</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-white/40" />
                  </div>
                  <input 
                    type="date" 
                    value={date}
                    style={{ colorScheme: "dark" }}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="w-5 h-5 text-white/40" />
                  </div>
                  <input 
                    type="time" 
                    value={time}
                    style={{ colorScheme: "dark" }}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white/60 text-sm font-semibold mb-2">Pickup Location</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-white/40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter full address or landmark"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-32 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                />
                <button 
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {detecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  Detect
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm font-semibold mb-2">Special Instructions (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Any specific requests or instructions for your host?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#0098FF] transition-colors resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 sm:p-8 sticky top-32">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            {type === 'package' && selectedPackage ? (
              <>
                <div className="flex items-start gap-4 pb-6 border-b border-white/10 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-[#0098FF]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-[#0098FF]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{selectedPackage.title}</h4>
                    <p className="text-sm text-white/60">{selectedPackage.category}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Base Price</span>
                    <span className="text-white font-medium">{selectedPackage.priceStr}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Taxes</span>
                    <span className="text-white font-medium">₹0</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-8">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-[#0098FF]">{selectedPackage.priceStr}</span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-white/60">
                <p>No specific package selected.</p>
              </div>
            )}

            <button 
              onClick={handleConfirm}
              className="w-full rounded-xl bg-[#0098FF] hover:bg-[#007acc] text-white font-bold py-4 transition-colors"
            >
              Confirm & Continue to Pay
            </button>
            <p className="text-center text-xs text-white/40 mt-4">
              You won't be charged yet.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030305]" />}>
      <BookingDetailsContent />
    </Suspense>
  );
}

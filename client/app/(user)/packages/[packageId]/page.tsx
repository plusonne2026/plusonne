"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PackagesAPI, Package } from "../../../lib/api/packages.api";
import { PaymentAPI } from "../../../lib/api/payment.api";
import { useAuth } from "../../../lib/context/AuthContext";
import { Calendar, MapPin, Loader2, Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "../../../lib/api/client";

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PackageDetailsPage({ params }: { params: Promise<{ packageId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form State
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const data = await PackagesAPI.getById(resolvedParams.packageId);
        setPkg(data);
      } catch (err: any) {
        setError(err.message || "Failed to load package");
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [resolvedParams.packageId]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!scheduledDate || !scheduledTime || !pickupLocation) {
      alert("Please fill in Date, Time, and Pickup Location.");
      return;
    }

    // Save details to sessionStorage to use in checkout page
    const bookingDetails = {
      scheduledDate,
      scheduledTime,
      pickupLocation,
      specialInstructions
    };
    sessionStorage.setItem("plusone_pending_booking", JSON.stringify(bookingDetails));
    
    // Redirect to checkout page
    router.push(`/packages/${pkg?.packageId}/checkout`);
  };

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#07090E] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white" /></div>;
  }

  if (error || !pkg) {
    return <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">{error || "Package not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-outfit">
      <header className="border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl p-4 sticky top-0 z-50">
        <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10">← Back</Button>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Package Image - Sticky on large screens */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square lg:sticky lg:top-24 rounded-3xl overflow-hidden shadow-2xl">
            <img src={pkg.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"} alt={pkg.name} className="object-cover w-full h-full" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {pkg.city}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">{pkg.name}</h1>
            
            <div className="flex items-center gap-6 mb-8 text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-400" /> {pkg.durationHours} Hours</span>
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-400" /> Max {pkg.distanceKm} km</span>
              <span className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> 4.9 Rating</span>
            </div>

            <p className="text-slate-400 leading-relaxed mb-8 text-lg">
              {pkg.description}
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> What's Included</h3>
              <ul className="space-y-3">
                {pkg.inclusions?.map((inc, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Schedule your session</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split("T")[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Time</label>
                  <input 
                    type="time" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Pickup Location</label>
                <input 
                  type="text" 
                  placeholder="Enter full address or landmark"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0098FF] transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Special Instructions (Optional)</label>
                <textarea 
                  placeholder="Any specific requests or instructions for your host?"
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0098FF] transition-colors resize-none" 
                ></textarea>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wide mb-1">Total Price</p>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  ₹{pkg.basePrice.toLocaleString('en-IN')}
                </div>
              </div>
              <Button 
                onClick={handleProceedToCheckout} 
                disabled={bookingLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-[#0C4CD9] to-[#1C7AFF] hover:from-[#1C7AFF] hover:to-[#0C4CD9] text-white font-bold text-lg px-12 py-8 rounded-2xl shadow-xl shadow-[#0C4CD9]/30 transition-all hover:scale-105"
              >
                {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

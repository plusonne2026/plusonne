"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { PricingAPI } from "../../lib/api/pricing.api";
import { CheckCircle2, ChevronLeft, Loader2, Wallet, Zap, Shield, Crown, Package } from "lucide-react";
import { toast } from "sonner";

// Mock packages for direct booking
const POPULAR_PACKAGES = [
  { id: "pkg_1", title: "Mumbai Midnight Drive", price: 2000, priceStr: "₹2,000", category: "City Explorer" },
  { id: "pkg_2", title: "Colaba Heritage Walk", price: 1500, priceStr: "₹1,500", category: "City Explorer" },
  { id: "pkg_3", title: "Fine Dining at Taj", price: 3500, priceStr: "₹3,500", category: "Dinner Companion" },
  { id: "pkg_4", title: "Sunday Tennis Partner", price: 1000, priceStr: "₹1,000", category: "Sports Buddy" },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pkgId = searchParams.get("pkgId");
  const selectedPackage = POPULAR_PACKAGES.find(p => p.id === pkgId);

  const { user } = useAuth();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [unitPrices, setUnitPrices] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);

  // Buy Units State
  const [buyHours, setBuyHours] = useState(0);
  const [buyKms, setBuyKms] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, pricesRes] = await Promise.all([
        PricingAPI.getActivePlans(),
        PricingAPI.getUnitPrices()
      ]);
      setPlans(plansRes.data || []);
      setUnitPrices(pricesRes.data || { hourPrice: 200, kmPrice: 15 });

      if (user) {
        const balanceRes = await PricingAPI.getMyBalance();
        setWalletBalance(balanceRes.data);
      }
    } catch (err) {
      console.error("Failed to load pricing data", err);
    } finally {
      setLoading(false);
    }
  };

  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setProcessing(true);
    try {
      // Mock Razorpay payment flow here, directly credit units for now
      // A Monthly Pro gives 100 Hours and 1000 KMs
      await PricingAPI.purchaseUnits(100, 1000, 3000);
      toast.success("Successfully Subscribed to Monthly Pro! Your wallet has been credited.");
      fetchData(); // Refresh balance
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyUnits = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (buyHours === 0 && buyKms === 0) return;
    
    setProcessing(true);
    try {
      const totalAmount = (buyHours * unitPrices.hourPrice) + (buyKms * unitPrices.kmPrice);
      await PricingAPI.purchaseUnits(buyHours, buyKms, totalAmount);
      toast.success(`Successfully added units to your wallet!`);
      setBuyHours(0);
      setBuyKms(0);
      fetchData(); // Refresh balance
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDirectBooking = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    router.push(`/booking/details?pkgId=${selectedPackage?.id}&type=package`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-outfit">
        <Loader2 className="w-8 h-8 text-[#0098FF] animate-spin" />
      </div>
    );
  }

  const totalBuyPrice = (buyHours * (unitPrices?.hourPrice || 0)) + (buyKms * (unitPrices?.kmPrice || 0));

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit">
      
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-[#030305] border-b border-white/[0.05] px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/home")}
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">Choose Pricing Model</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Shield className="w-4 h-4 text-emerald-400" /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Select your preferred payment method</h2>
          <p className="text-white/60">Choose an elite subscription package or top-up your wallet for flexible, on-demand bookings.</p>
        </div>

        <div className="flex flex-col gap-12">
          
          {/* Direct Package Booking (Only if pkgId is present) */}
          {selectedPackage && (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-[#0098FF]" />
                <h3 className="text-2xl font-bold text-white">Direct Package Booking</h3>
              </div>

              <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 w-full">
                  <div className="inline-block px-3 py-1 rounded bg-white/10 text-white/80 text-xs font-semibold mb-4">
                    {selectedPackage.category}
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-2">{selectedPackage.title}</h4>
                  <p className="text-white/60">Directly book this specific package without needing a subscription or wallet balance.</p>
                </div>

                <div className="w-full md:w-80 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/60">Package Cost</span>
                    <span className="text-white font-bold">{selectedPackage.priceStr}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <span className="text-white/60">Taxes</span>
                    <span className="text-white font-bold">₹0</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/80 font-bold">Total</span>
                    <span className="text-2xl font-bold text-[#0098FF]">{selectedPackage.priceStr}</span>
                  </div>

                  <button 
                    onClick={handleDirectBooking}
                    className="w-full rounded-xl bg-[#0098FF] hover:bg-[#007acc] text-white font-bold py-4 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Premium Subscriptions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.length === 0 ? (
                <div className="col-span-full py-12 text-center border border-white/10 rounded-2xl bg-[#0A0A0C]">
                  <p className="text-white/40">No plans are currently active.</p>
                </div>
              ) : plans.map((plan) => {
                const isPremium = plan.type === 'annual';
                
                return (
                  <div key={plan.planId} className={`rounded-2xl p-6 sm:p-8 flex flex-col ${isPremium ? 'bg-[#131A2B] border border-[#0098FF]/30' : 'bg-[#0A0A0C] border border-white/[0.08]'}`}>
                    <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="mb-6 pb-6 border-b border-white/[0.08]">
                      <span className="text-4xl font-bold text-white">₹{plan.price.toLocaleString()}</span>
                      <span className="text-white/60 ml-1">/{plan.type}</span>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-white/50" />
                        <span className="text-white/80">{plan.hoursIncluded} Hours included</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-white/50" />
                        <span className="text-white/80">{plan.kmIncluded} KMs included</span>
                      </div>
                      {plan.priorityBooking && (
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-amber-400" />
                          <span className="text-white/80">Priority Booking</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => handleSubscribe(plan.planId)}
                      disabled={processing}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-colors ${isPremium ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'} disabled:opacity-50`}
                    >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* On-Demand Wallet */}
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">On-Demand Wallet</h3>
            </div>

            <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start justify-between gap-8">
              
              {/* Balance */}
              <div className="flex-1 w-full">
                <p className="text-sm font-semibold text-white/60 uppercase mb-4">Current Balance</p>
                {walletBalance ? (
                  <div className="flex gap-8">
                    <div>
                      <span className="text-4xl font-bold text-white block mb-1">{walletBalance.hoursBalance || 0}</span>
                      <span className="text-sm text-emerald-400 font-medium">Hours</span>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <span className="text-4xl font-bold text-white block mb-1">{walletBalance.kmBalance || 0}</span>
                      <span className="text-sm text-emerald-400 font-medium">KMs</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40">Loading balance...</p>
                )}
              </div>

              {/* Top-up Form */}
              <div className="w-full lg:w-96 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Buy Units</h4>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Hours (₹{unitPrices?.hourPrice}/hr)</span>
                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                      <button onClick={() => setBuyHours(Math.max(0, buyHours - 1))} className="w-8 h-8 rounded flex items-center justify-center bg-white/10 text-white hover:bg-white/20">-</button>
                      <span className="w-6 text-center font-bold text-white">{buyHours}</span>
                      <button onClick={() => setBuyHours(buyHours + 1)} className="w-8 h-8 rounded flex items-center justify-center bg-white/10 text-white hover:bg-white/20">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/80">KMs (₹{unitPrices?.kmPrice}/km)</span>
                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                      <button onClick={() => setBuyKms(Math.max(0, buyKms - 10))} className="w-8 h-8 rounded flex items-center justify-center bg-white/10 text-white hover:bg-white/20">-</button>
                      <span className="w-6 text-center font-bold text-white">{buyKms}</span>
                      <button onClick={() => setBuyKms(buyKms + 10)} className="w-8 h-8 rounded flex items-center justify-center bg-white/10 text-white hover:bg-white/20">+</button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
                  <span className="text-white/60 font-semibold">Total Cost</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{totalBuyPrice.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleBuyUnits}
                  disabled={totalBuyPrice === 0 || processing}
                  className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-emerald-500"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay to Top-up"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-outfit">
        <Loader2 className="w-8 h-8 text-[#0098FF] animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}

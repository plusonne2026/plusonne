"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { PricingAPI } from "../../lib/api/pricing.api";
import { CheckCircle2, ChevronLeft, Loader2, Sparkles, Wallet, Zap, Shield, Crown, Package } from "lucide-react";

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
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setProcessingId(planId);
    setTimeout(() => {
      alert(`Successfully subscribed to plan: ${planId}`);
      setProcessingId(null);
      router.push("/home");
    }, 1500);
  };

  const handleBuyUnits = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (buyHours === 0 && buyKms === 0) return;

    setProcessingId("wallet");
    const totalAmount = (buyHours * unitPrices.hourPrice) + (buyKms * unitPrices.kmPrice);
    
    try {
      await PricingAPI.purchaseUnits(buyHours, buyKms, totalAmount);
      alert(`Successfully purchased units for ₹${totalAmount.toLocaleString()}`);
      
      const balanceRes = await PricingAPI.getMyBalance();
      setWalletBalance(balanceRes.data);
      setBuyHours(0);
      setBuyKms(0);
    } catch (err: any) {
      alert("Failed to purchase units: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectBooking = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setProcessingId("package");
    setTimeout(() => {
      alert(`Successfully booked ${selectedPackage?.title}!`);
      setProcessingId(null);
      router.push("/bookings");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-outfit">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-16 h-16 border-t-2 border-[#0098FF] rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-b-2 border-purple-500 rounded-full animate-spin reverse"></div>
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>
    );
  }

  const totalBuyPrice = (buyHours * (unitPrices?.hourPrice || 0)) + (buyKms * (unitPrices?.kmPrice || 0));

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit relative overflow-x-hidden selection:bg-[#0098FF]/30">
      
      {/* Immersive Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#0047FF]/10 to-[#0098FF]/5 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#9B51E0]/15 to-[#FF007A]/5 blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Glass Header */}
      <header className="sticky top-0 z-50 bg-[#030305]/60 backdrop-blur-2xl border-b border-white/[0.05] px-4 py-4 md:py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/home")}
              className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] hover:scale-105 transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold block mb-0.5">PlusOnne Platform</span>
              <h1 className="text-lg font-black text-white leading-none">Service Models</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-full py-1.5 px-4">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white/80">Secure SSL Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        
        {/* Page Hero */}
        <div className="text-center mb-16 sm:mb-24 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[200px] h-[50px] bg-[#0098FF]/20 blur-[50px] rounded-full" />
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.1] relative">
            Elevate Your <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0098FF] via-[#0C4CD9] to-[#9B51E0]">
              Experience
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
            Unlock the full potential of PlusOnne. Choose an elite subscription package or top-up your wallet for flexible, on-demand bookings.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
          
          {/* Subscription Plans Area */}
          <div className="flex-1 w-full space-y-8">
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/5 flex items-center justify-center shadow-inner">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Premium Subscriptions</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Unlimited Potential</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {plans.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-white/[0.01]">
                  <p className="text-white/40 font-medium">No plans are currently active.</p>
                </div>
              ) : plans.map((plan) => {
                const isPremium = plan.type === 'annual';
                
                return (
                  <div 
                    key={plan.planId} 
                    className={`relative group rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-2
                      ${isPremium 
                        ? 'bg-gradient-to-b from-[#131A2B] to-[#0A0E17] border border-[#0098FF]/30 shadow-[0_20px_40px_-15px_rgba(0,152,255,0.2)]' 
                        : 'bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04]'}
                    `}
                  >
                    {isPremium && (
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0098FF] to-transparent opacity-70" />
                    )}
                    
                    {/* Background glow hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="p-8 relative z-10 flex flex-col h-full">
                      {isPremium && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0098FF]/10 border border-[#0098FF]/20 text-[#0098FF] text-[10px] font-black uppercase tracking-widest mb-6 w-max">
                          <Sparkles className="w-3 h-3" /> Most Popular
                        </div>
                      )}
                      {!isPremium && <div className="h-[28px] mb-6" />}
                      
                      <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                      <div className="mb-8 pb-8 border-b border-white/[0.08]">
                        <span className="text-5xl font-black text-white tracking-tighter">₹{plan.price.toLocaleString()}</span>
                        <span className="text-white/40 font-bold ml-1">/{plan.type}</span>
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            <CheckCircle2 className="w-3 h-3 text-white/70" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block leading-none mb-1">{plan.hoursIncluded} Hours</span>
                            <span className="text-xs text-white/40 block">Included platform time</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            <CheckCircle2 className="w-3 h-3 text-white/70" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block leading-none mb-1">{plan.kmIncluded} KMs</span>
                            <span className="text-xs text-white/40 block">Included travel distance</span>
                          </div>
                        </div>

                        {plan.priorityBooking && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-[#0098FF]/10 flex items-center justify-center shrink-0 border border-[#0098FF]/20">
                              <Zap className="w-3 h-3 text-[#0098FF]" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white block leading-none mb-1">Priority Booking</span>
                              <span className="text-xs text-white/40 block">Skip the queue for hosts</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleSubscribe(plan.planId)}
                        disabled={processingId !== null}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 relative overflow-hidden group/btn
                          ${isPremium 
                            ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                            : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1]'}
                        `}
                      >
                        {processingId === plan.planId ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <span className="relative z-10">Choose {plan.name}</span>
                        )}
                        {isPremium && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Flexible Pay-Per-Use Area */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/5 flex items-center justify-center shadow-inner">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">On-Demand Wallet</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Pay as you go</p>
                </div>
              </div>

              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden mt-8 h-[calc(100%-80px)]">
                {/* Accent Gradients */}
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] pointer-events-none" />
                
                {/* Balance Display */}
                <div className="mb-10 pb-8 border-b border-white/[0.08]">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Current Wallet Balance</p>
                  {walletBalance ? (
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-4xl font-black text-white tracking-tighter leading-none block mb-1">{walletBalance.hoursBalance || 0}</span>
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Hours</span>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div>
                        <span className="text-4xl font-black text-white tracking-tighter leading-none block mb-1">{walletBalance.kmBalance || 0}</span>
                        <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Kilometers</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-white/30">Loading balance...</p>
                  )}
                </div>

                {/* Top-up Form */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-white">Add Hours</span>
                      <span className="text-xs font-medium text-white/40">₹{unitPrices?.hourPrice}/hr</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-2 shadow-inner">
                      <button onClick={() => setBuyHours(Math.max(0, buyHours - 1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">-</button>
                      <span className="font-black text-xl w-12 text-center text-white">{buyHours}</span>
                      <button onClick={() => setBuyHours(buyHours + 1)} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">+</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-white">Add Kilometers</span>
                      <span className="text-xs font-medium text-white/40">₹{unitPrices?.kmPrice}/km</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-2 shadow-inner">
                      <button onClick={() => setBuyKms(Math.max(0, buyKms - 10))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">-</button>
                      <span className="font-black text-xl w-12 text-center text-white">{buyKms}</span>
                      <button onClick={() => setBuyKms(buyKms + 10)} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">+</button>
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-white/[0.08] flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Total Due</p>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tighter">
                        ₹{totalBuyPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleBuyUnits}
                    disabled={processingId !== null || totalBuyPrice === 0}
                    className="w-full relative group/pay overflow-hidden rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#030305] font-black py-5 transition-all border-none disabled:opacity-30 disabled:hover:bg-emerald-500 mt-6"
                  >
                    {processingId === "wallet" ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                        <Zap className="w-4 h-4" /> Secure Payment
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/pay:translate-y-0 transition-transform duration-300 rounded-2xl" />
                  </button>
                  <p className="text-center text-[10px] text-white/30 font-medium mt-4 flex justify-center items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Secured by 256-bit encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Direct Package Booking (Only if pkgId is present) */}
          {selectedPackage && (
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/5 flex items-center justify-center shadow-inner">
                  <Package className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Direct Booking</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Pay for package only</p>
                </div>
              </div>

              <div className="bg-white/[0.02] backdrop-blur-3xl border border-[#FF007A]/30 rounded-[32px] p-6 sm:p-8 shadow-[0_0_30px_rgba(255,0,122,0.1)] relative overflow-hidden mt-8 h-[calc(100%-80px)] flex flex-col">
                {/* Accent Gradients */}
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF007A]/10 blur-[80px] pointer-events-none" />
                
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest mb-6">
                    {selectedPackage.category}
                  </div>
                  
                  <h4 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedPackage.title}</h4>
                  <p className="text-white/50 mb-8">Pay a fixed price to directly book this specific package without needing a subscription or wallet balance.</p>

                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                      <span className="text-white/60 font-medium">Package Cost</span>
                      <span className="text-white font-bold">{selectedPackage.priceStr}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                      <span className="text-white/60 font-medium">Taxes & Fees</span>
                      <span className="text-white font-bold">₹0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 font-black">Total Direct Payment</span>
                      <span className="text-2xl font-black text-rose-400">{selectedPackage.priceStr}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleDirectBooking}
                  disabled={processingId !== null}
                  className="w-full relative group/pay overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black py-5 transition-all border-none disabled:opacity-50 mt-6"
                >
                  {processingId === "package" ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2 text-base shadow-sm">
                      <Zap className="w-4 h-4" /> Book Package Direct
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/pay:translate-y-0 transition-transform duration-300 rounded-2xl" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
  );
}

export default function PricingPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-outfit">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-16 h-16 border-t-2 border-[#0098FF] rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-b-2 border-purple-500 rounded-full animate-spin reverse"></div>
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}

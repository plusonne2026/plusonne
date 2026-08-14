"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { PricingAPI } from "../../lib/api/pricing.api";
import { Loader2, Wallet, Zap, Shield, Crown, ChevronLeft, CreditCard, History, Plus } from "lucide-react";
import { toast } from "sonner";

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [unitPrices, setUnitPrices] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<any>({ totalHours: 0, totalKms: 0, status: "active" });
  const [loading, setLoading] = useState(true);

  // Buy Units State
  const [buyHours, setBuyHours] = useState(2);
  const [buyKms, setBuyKms] = useState(20);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const pricesRes = await PricingAPI.getUnitPrices();
      setUnitPrices(pricesRes.data || { hourPrice: 200, kmPrice: 15 });

      if (user) {
        const balanceRes = await PricingAPI.getMyBalance();
        if (balanceRes.data) {
          setWalletBalance(balanceRes.data);
        }
      }
    } catch (err) {
      console.error("Failed to load wallet data", err);
    } finally {
      setLoading(false);
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
      // Simulating payment
      await PricingAPI.purchaseUnits(buyHours, buyKms, totalAmount);
      toast.success(`Payment of ₹${totalAmount} successful! Units added to wallet.`);
      fetchData(); // Refresh balance
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
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
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030305]/80 backdrop-blur-md border-b border-white/[0.05] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/home")}
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">My Wallet</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
            <Shield className="w-4 h-4" /> Secure
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-indigo-900 via-[#1A1F35] to-[#0A0D14] border border-indigo-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-200 font-medium mb-1 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Available Balance
              </p>
              <div className="flex items-end gap-6 mt-4">
                <div>
                  <h2 className="text-5xl font-black text-white">{walletBalance.totalHours}</h2>
                  <p className="text-indigo-200 text-sm mt-1 font-bold">Hours Left</p>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div>
                  <h2 className="text-5xl font-black text-white">{walletBalance.totalKms}</h2>
                  <p className="text-indigo-200 text-sm mt-1 font-bold">KMs Left</p>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">VIP Member</p>
              <p className="text-[10px] text-amber-200/70 mt-1">Active Status</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Top Up Section */}
          <div className="p-6 md:p-8 rounded-[32px] bg-[#0A0D14] border border-white/[0.08] relative overflow-hidden group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#0098FF]" /> Top Up Units
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400 font-medium">Extra Hours</span>
                  <span className="text-white font-bold">{buyHours} hrs</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="24" step="1"
                  value={buyHours}
                  onChange={(e) => setBuyHours(parseInt(e.target.value))}
                  className="w-full accent-[#0098FF] h-2 bg-white/[0.05] rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-zinc-500 mt-2">₹{unitPrices?.hourPrice}/hr</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400 font-medium">Extra KMs</span>
                  <span className="text-white font-bold">{buyKms} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="200" step="5"
                  value={buyKms}
                  onChange={(e) => setBuyKms(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-white/[0.05] rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-zinc-500 mt-2">₹{unitPrices?.kmPrice}/km</p>
              </div>

              <div className="pt-6 border-t border-white/[0.05]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400">Total Amount</span>
                  <span className="text-2xl font-black text-white">₹{totalBuyPrice}</span>
                </div>
                <button 
                  onClick={handleBuyUnits}
                  disabled={processing || totalBuyPrice === 0}
                  className="w-full py-4 rounded-xl bg-white text-black font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  {processing ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="p-6 md:p-8 rounded-[32px] bg-[#0A0D14] border border-white/[0.08]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" /> Recent Transactions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Top Up Units</p>
                    <p className="text-xs text-zinc-500">Aug 12, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">+5 hrs, 50 km</p>
                  <p className="text-xs text-zinc-500">₹1,750</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Session Deduction</p>
                    <p className="text-xs text-zinc-500">Aug 10, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-400">-2 hrs, 15 km</p>
                  <p className="text-xs text-zinc-500">Used</p>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <button className="text-sm font-bold text-[#0098FF] hover:text-[#007acc]">
                  View All History
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

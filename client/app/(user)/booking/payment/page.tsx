"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ShieldCheck, Loader2, CreditCard, Smartphone } from "lucide-react";

const POPULAR_PACKAGES = [
  { id: "pkg_1", title: "Mumbai Midnight Drive", price: 2000, priceStr: "₹2,000", category: "City Explorer" },
  { id: "pkg_2", title: "Colaba Heritage Walk", price: 1500, priceStr: "₹1,500", category: "City Explorer" },
  { id: "pkg_3", title: "Fine Dining at Taj", price: 3500, priceStr: "₹3,500", category: "Dinner Companion" },
  { id: "pkg_4", title: "Sunday Tennis Partner", price: 1000, priceStr: "₹1,000", category: "Sports Buddy" },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const pkgId = searchParams.get("pkgId");
  
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("upi");

  const selectedPackage = POPULAR_PACKAGES.find(p => p.id === pkgId);

  const handlePayment = () => {
    setProcessing(true);
    // Simulate Razorpay mock flow
    setTimeout(() => {
      setProcessing(false);
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (pkgId) params.set("pkgId", pkgId);
      // add a mock booking ID
      params.set("bookingId", "bk_" + Math.floor(Math.random() * 1000000));
      router.push(`/booking/confirmed?${params.toString()}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030305] border-b border-white/[0.05] px-4 py-4 md:py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              disabled={processing}
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Payment</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Secure 256-bit encryption</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Side - Payment Methods */}
        <div className="flex-1">
          <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Select Payment Method</h2>
            
            <div className="space-y-4">
              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${method === 'upi' ? 'bg-[#0098FF]/10 border-[#0098FF]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                onClick={() => setMethod('upi')}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${method === 'upi' ? 'border-[#0098FF]' : 'border-white/30'}`}>
                  {method === 'upi' && <div className="w-3 h-3 rounded-full bg-[#0098FF]" />}
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">UPI</h4>
                  <p className="text-sm text-white/60">Google Pay, PhonePe, Paytm</p>
                </div>
              </label>

              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${method === 'card' ? 'bg-[#0098FF]/10 border-[#0098FF]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                onClick={() => setMethod('card')}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${method === 'card' ? 'border-[#0098FF]' : 'border-white/30'}`}>
                  {method === 'card' && <div className="w-3 h-3 rounded-full bg-[#0098FF]" />}
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Credit / Debit Card</h4>
                  <p className="text-sm text-white/60">Visa, MasterCard, RuPay</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Booking amount</span>
                <span className="text-white">{selectedPackage?.priceStr || "₹0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Platform fee</span>
                <span className="text-white">₹0</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-8">
              <span className="text-white font-bold">Payable Total</span>
              <span className="text-2xl font-bold text-white">{selectedPackage?.priceStr || "₹0"}</span>
            </div>

            <button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full relative rounded-xl bg-white hover:bg-white/90 text-black font-bold py-4 transition-colors disabled:opacity-70 disabled:hover:bg-white"
            >
              {processing ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0098FF]" />
              ) : (
                `Pay ${selectedPackage?.priceStr || "₹0"}`
              )}
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/40">
              <ShieldCheck className="w-4 h-4" /> Powerd by MockRazorpay
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030305]" />}>
      <PaymentContent />
    </Suspense>
  );
}

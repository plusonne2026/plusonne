"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PackagesAPI, Package } from "../../../../lib/api/packages.api";
import { PricingAPI } from "../../../../lib/api/pricing.api";
import { PaymentAPI } from "../../../../lib/api/payment.api";
import { useAuth } from "../../../../lib/context/AuthContext";
import { apiClient } from "../../../../lib/api/client";
import { Loader2, ArrowLeft, Wallet, CreditCard, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage({ params }: { params: Promise<{ packageId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">("cash");

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/auth/login");
      return;
    }

    const initCheckout = async () => {
      try {
        setLoading(true);
        // Load stored booking form data
        const stored = sessionStorage.getItem("plusone_pending_booking");
        if (!stored) {
          router.push(`/packages/${resolvedParams.packageId}`);
          return;
        }
        setBookingDetails(JSON.parse(stored));

        // Fetch package details
        const packageData = await PackagesAPI.getById(resolvedParams.packageId);
        setPkg(packageData);

        // Fetch user wallet balance
        const balanceRes = await PricingAPI.getMyBalance();
        setUserBalance(balanceRes.data);

        // Auto-select wallet if they have enough balance
        if (balanceRes.data && balanceRes.data.hoursBalance >= (packageData.durationHours || 0)) {
          setPaymentMethod("wallet");
        }

      } catch (err: any) {
        setError(err.message || "Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      initCheckout();
    }
  }, [resolvedParams.packageId, isAuthenticated, authLoading, router]);

  const handleConfirmBooking = async () => {
    setProcessing(true);
    try {
      const isWallet = paymentMethod === "wallet";

      // 1. Create Booking in Database
      const bookingData = {
        categoryId: pkg?.categoryId,
        packageId: pkg?.packageId,
        pricingModel: isWallet ? "unit" : "package",
        scheduledDate: bookingDetails.scheduledDate,
        scheduledTime: bookingDetails.scheduledTime,
        pickupLocation: {
          lat: 19.076, // Mock coords for MVP
          lng: 72.877,
          address: bookingDetails.pickupLocation
        },
        specialInstructions: bookingDetails.specialInstructions,
      };

      const bookingResponse = await apiClient.post("/bookings", bookingData) as any;
      if (!bookingResponse.success) throw new Error("Failed to create booking");
      const bookingId = bookingResponse.data.bookingId;

      if (isWallet) {
        // If wallet, backend automatically deducts. We just show success.
        // In a real app, you might have a `/payments/wallet-deduct` endpoint.
        sessionStorage.removeItem("plusone_pending_booking");
        setPaymentSuccess(true);
      } else {
        // If cash, go through Razorpay
        const order = await PaymentAPI.createOrder(bookingId);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "PlusOnne",
          description: `Booking for ${pkg?.name}`,
          order_id: order.orderId,
          handler: async function (response: any) {
            try {
              await PaymentAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingId,
              });
              sessionStorage.removeItem("plusone_pending_booking");
              setPaymentSuccess(true);
            } catch (err) {
              alert("Payment verification failed. If money was deducted, it will be refunded.");
            }
          },
          prefill: {
            name: user?.displayName || "Test User",
            email: user?.email || "test@example.com",
          },
          theme: { color: "#0C4CD9" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          alert(`Payment Failed: ${response.error.description}`);
          setProcessing(false);
        });
        rzp.open();
        
        // Don't set processing to false yet, wait for Razorpay callback
      }
    } catch (err: any) {
      alert(`Checkout Error: ${err.message}`);
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#07090E] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  if (error || !pkg) {
    return <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">{error || "Something went wrong"}</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white font-outfit">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black mb-4">Booking Confirmed!</h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">Your booking for {pkg.name} on {bookingDetails?.scheduledDate} has been successfully processed.</p>
        <Button onClick={() => router.push("/home")} className="bg-[#0098FF] hover:bg-[#007acc] text-white font-bold px-8 py-6 rounded-2xl transition-colors">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const requiredHours = pkg.durationHours || 0;
  const hasEnoughBalance = userBalance && userBalance.hoursBalance >= requiredHours;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-outfit pb-24">
      <header className="border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Secure Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Left Column: Payment Methods */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h2 className="text-2xl font-black">Select Payment Method</h2>
            
            {/* Wallet Option */}
            <div 
              onClick={() => hasEnoughBalance && setPaymentMethod("wallet")}
              className={`relative border-2 rounded-2xl p-6 transition-all ${!hasEnoughBalance ? 'opacity-50 grayscale border-white/5 bg-white/5' : paymentMethod === "wallet" ? 'border-[#0098FF] bg-[#0098FF]/10' : 'border-white/10 bg-white/5 hover:border-white/20 cursor-pointer'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${paymentMethod === 'wallet' ? 'bg-[#0098FF]/20 text-[#0098FF]' : 'bg-white/10 text-slate-300'}`}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">PlusOne Wallet</h3>
                    <p className="text-sm text-slate-400">Pay using your Subscription or Unit balance</p>
                  </div>
                </div>
                {paymentMethod === "wallet" && <CheckCircle2 className="w-6 h-6 text-[#0098FF]" />}
              </div>
              
              <div className="bg-black/40 rounded-xl p-4 mt-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Available Balance</p>
                  <p className="font-bold">{userBalance?.hoursBalance || 0} Hours</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Required</p>
                  <p className={`font-bold ${!hasEnoughBalance ? 'text-red-400' : 'text-emerald-400'}`}>{requiredHours} Hours</p>
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="mt-4">
                  <Button onClick={(e) => { e.stopPropagation(); router.push(`/pricing`); }} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                    Recharge Wallet
                  </Button>
                </div>
              )}
            </div>

            {/* Cash/Razorpay Option */}
            <div 
              onClick={() => setPaymentMethod("cash")}
              className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${paymentMethod === "cash" ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${paymentMethod === 'cash' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-slate-300'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Pay Online</h3>
                    <p className="text-sm text-slate-400">UPI, Cards, Netbanking via Razorpay</p>
                  </div>
                </div>
                {paymentMethod === "cash" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </div>
            </div>
            
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-6">Order Summary</h3>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                <img src={pkg.images?.[0] || ""} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold leading-tight mb-1">{pkg.name}</h4>
                  <p className="text-xs text-slate-400">{pkg.city}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
                  <span className="font-medium text-right">{bookingDetails?.scheduledDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                  <span className="font-medium text-right">{bookingDetails?.scheduledTime}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 flex items-center gap-2 flex-shrink-0"><MapPin className="w-4 h-4" /> Pickup</span>
                  <span className="font-medium text-right max-w-[150px] truncate">{bookingDetails?.pickupLocation}</span>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Total Price</span>
                  <span className="font-bold text-lg">₹{pkg.basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Safe & Secure Payment
                </div>
              </div>

              <Button 
                onClick={handleConfirmBooking}
                disabled={processing || (paymentMethod === "wallet" && !hasEnoughBalance)}
                className="w-full bg-gradient-to-r from-[#0C4CD9] to-[#1C7AFF] hover:from-[#1C7AFF] hover:to-[#0C4CD9] text-white font-bold py-6 rounded-xl shadow-lg transition-all"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Confirm ${paymentMethod === 'wallet' ? 'using Wallet' : 'Payment'}`
                )}
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

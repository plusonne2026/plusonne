"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, UserCircle2, MapPin, Calendar, Clock } from "lucide-react";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const pkgId = searchParams.get("pkgId");

  const [status, setStatus] = useState("pending_assignment");

  useEffect(() => {
    // Simulate host assignment after 3 seconds
    const timer = setTimeout(() => {
      setStatus("host_assigned");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-white/60">Your payment was successful. ID: {bookingId || "BK_104829"}</p>
        </div>

        <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <h3 className="font-bold text-white">Status</h3>
            {status === "pending_assignment" ? (
              <span className="flex items-center gap-2 text-sm text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Finding Host...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Host Assigned
              </span>
            )}
          </div>

          {status === "host_assigned" && (
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <UserCircle2 className="w-8 h-8 text-white/50" />
              </div>
              <div>
                <h4 className="font-bold text-white">Rahul Sharma</h4>
                <p className="text-sm text-white/60">★ 4.9 • City Explorer</p>
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-white/40 shrink-0" />
              <div>
                <span className="text-white/60 block">Date</span>
                <span className="text-white font-medium">Sat, 24 Jun 2026</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-white/40 shrink-0" />
              <div>
                <span className="text-white/60 block">Time</span>
                <span className="text-white font-medium">18:00 PM</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-white/40 shrink-0" />
              <div>
                <span className="text-white/60 block">Pickup Location</span>
                <span className="text-white font-medium">Taj Mahal Palace, Colaba</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push("/home")}
          className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold py-4 transition-colors flex items-center justify-center gap-2"
        >
          Return to Home <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030305]" />}>
      <ConfirmationContent />
    </Suspense>
  );
}

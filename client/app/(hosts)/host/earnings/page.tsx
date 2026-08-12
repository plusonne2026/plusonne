"use client";

import React, { useState, useEffect } from "react";
import { HostAPI } from "@/app/lib/api/host.api";
import { BookingAPI, BookingRequest as APIBookingRequest } from "@/app/lib/api/booking.api";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  History,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function HostEarningsPage() {
  const [earnings, setEarnings] = useState({ thisMonth: 0, lastMonth: 0, total: 0, pending: 0 });
  const [completedSessions, setCompletedSessions] = useState<APIBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const earningsData = await HostAPI.getEarnings();
      if (earningsData) {
        setEarnings(earningsData);
      }

      const bookingsData = await BookingAPI.getMyBookings("host");
      const completed = bookingsData.filter((b: APIBookingRequest) => b.status === "completed");
      setCompletedSessions(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Earnings</h1>
          <p className="text-sm text-slate-400 mt-1">Track your revenue and payout history.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C4CD9]/10 to-[#0098FF]/5 border border-[#0098FF]/20 space-y-1 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0098FF]/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#0098FF] font-black uppercase tracking-wider">This Month</span>
            <TrendingUp className="w-4 h-4 text-[#0098FF]" />
          </div>
          <span className="text-3xl font-black text-white">₹{earnings.thisMonth.toLocaleString()}</span>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 space-y-1 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-500 font-black uppercase tracking-wider">Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-white">₹{earnings.pending.toLocaleString()}</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Earned</span>
            <IndianRupee className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="text-3xl font-black text-white">₹{earnings.total.toLocaleString()}</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Last Month</span>
            <History className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="text-3xl font-black text-zinc-300">₹{earnings.lastMonth.toLocaleString()}</span>
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08]">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-[#0098FF]" /> Recent Payouts
        </h3>

        <div className="space-y-3">
          {completedSessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-500 text-sm font-bold">No completed sessions yet.</p>
            </div>
          ) : (
            completedSessions.map((session) => (
              <div key={session.id || session.bookingId} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Session with {session.clientName}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{session.date} • {session.duration} • {session.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">+₹{session.payout}</span>
                  <span className="text-[10px] text-zinc-500 font-bold">Cleared</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

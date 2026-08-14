"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "@/app/lib/api/admin.api";
import { Banknote, Loader2, IndianRupee, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function AdminFinancePage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getPendingPayouts();
      setPayouts(data || []);
    } catch (error) {
      console.error("Failed to fetch pending payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcessPayout = async (bookingId: string) => {
    try {
      setProcessingId(bookingId);
      await AdminAPI.processPayout(bookingId);
      // Remove from list or mark as processed
      setPayouts(payouts.filter(p => p.bookingId !== bookingId));
    } catch (error) {
      console.error("Failed to process payout:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const calculateCommission = (booking: any) => {
    // Assuming base price or unit cost. If amount is not direct, parse from payout or total
    const total = booking.amount || booking.payout || 0;
    const platformFee = total * 0.20;
    const hostShare = total - platformFee;
    return { total, platformFee, hostShare };
  };

  const filteredPayouts = payouts.filter(p => 
    p.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.hostId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-outfit">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Banknote className="w-8 h-8 text-emerald-500" />
            Finance & Settlements
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
            Process pending payouts for completed sessions. Platform commission is automatically calculated at 20%.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Host ID or Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 bg-[#111624] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            onClick={fetchPayouts}
            className="p-2.5 bg-[#111624] border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white"
          >
            <Loader2 className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="bg-[#111624] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Session Details</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Commission (20%)</th>
                <th className="px-6 py-4 text-xs font-bold text-emerald-500 uppercase tracking-wider">Host Payout</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
                    Fetching pending settlements...
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                    <CheckCircle2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-lg text-white font-medium mb-1">All Caught Up!</p>
                    <p>No pending payouts require processing at this time.</p>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => {
                  const { total, platformFee, hostShare } = calculateCommission(payout);
                  
                  return (
                    <tr key={payout.bookingId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-mono text-white mb-1">
                          {payout.bookingId}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Host: <span className="text-zinc-300">{payout.hostId}</span>
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          Ended: {payout.updatedAt ? format(new Date(payout.updatedAt), "PPP p") : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-zinc-300 font-medium">
                          <IndianRupee className="w-4 h-4" />
                          {total.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-rose-400 font-medium">
                          <IndianRupee className="w-4 h-4" />
                          {platformFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg inline-flex">
                          <IndianRupee className="w-5 h-5" />
                          {hostShare.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleProcessPayout(payout.bookingId)}
                          disabled={processingId === payout.bookingId}
                          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {processingId === payout.bookingId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Process
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

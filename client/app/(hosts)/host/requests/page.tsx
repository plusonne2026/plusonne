"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingAPI, BookingRequest as APIBookingRequest } from "@/app/lib/api/booking.api";
import {
  CalendarIcon,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
  Check
} from "lucide-react";
import { useAuth } from "@/app/lib/context/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HostRequestsPage() {
  const [requests, setRequests] = useState<APIBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  const [confirmAction, setConfirmAction] = useState<{ type: "accept" | "decline", id: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await BookingAPI.getRequests();
      // Filter for only pending matches (if API didn't already)
      const pending = data.filter((b: APIBookingRequest) => b.status === "pending_match" || b.status === "pending");
      setRequests(pending);
    } catch (err) {
      console.error(err);
      // Fallback UI logic if backend isn't ready
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    setIsProcessing(true);
    try {
      await BookingAPI.updateStatus(id, "host_confirmed" as any);
      setRequests((prev) => prev.filter((r) => (r.id || r.bookingId) !== id));
      toast.success("Booking Accepted Successfully!", {
        description: "Entering Live Session dashboard..."
      });
      router.push(`/host/session/${id}`);
    } catch (err) {
      toast.error("Failed to accept booking.");
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleDeclineRequest = async (id: string) => {
    setIsProcessing(true);
    try {
      await BookingAPI.updateStatus(id, "rejected" as any, "Host declined the request");
      setRequests((prev) => prev.filter((r) => (r.id || r.bookingId) !== id));
      toast.success("Booking Declined");
    } catch (err: any) {
      toast.error(err.message || "Failed to decline booking.");
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };
  
  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "accept") handleAcceptRequest(confirmAction.id);
    else handleDeclineRequest(confirmAction.id);
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Incoming Requests</h1>
          <p className="text-sm text-slate-400 mt-1">Review and accept bookings that match your profile.</p>
        </div>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="p-12 rounded-[32px] bg-[#0D111A] border border-white/[0.08] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white">All Caught Up!</h3>
            <p className="text-zinc-400 mt-2">There are no new booking requests at the moment.</p>
          </div>
        ) : (
          requests.map((request) => {
            const reqId = request.id || request.bookingId;
            return (
              <div
                key={reqId}
                className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] hover:border-[#0098FF]/30 transition-colors shadow-2xl relative overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Client Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={request.clientAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt={request.clientName}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/[0.1]"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0098FF]/20 text-[#0098FF] border border-[#0098FF]/40 text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                        {request.category}
                      </span>
                      <h3 className="text-xl font-black text-white">{request.clientName}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-zinc-500" /> {request.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-zinc-500" /> {request.time} ({request.duration})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details & Actions */}
                  <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-zinc-500 font-bold block mb-1">Estimated Payout</span>
                      <span className="text-2xl font-black text-emerald-400 flex items-center md:justify-end gap-1">
                        ₹ {request.payout}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setConfirmAction({ type: "decline", id: reqId })}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-zinc-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: "accept", id: reqId })}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] hover:from-[#0C4CD9] hover:to-[#1C7AFF] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0098FF]/25"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Request
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="line-clamp-1">{request.location}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-[#0D111A] border border-white/[0.08] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {confirmAction?.type === "accept" 
                ? "This will accept the booking and add it to your schedule. The user will be notified." 
                : "This will decline the booking request. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="bg-transparent border-white/[0.08] hover:bg-white/[0.05] text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isProcessing}
              onClick={(e) => { e.preventDefault(); handleConfirm(); }}
              className={`text-white font-bold ${confirmAction?.type === "accept" ? "bg-[#0098FF] hover:bg-[#0098FF]/80" : "bg-red-500 hover:bg-red-500/80"}`}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {confirmAction?.type === "accept" ? "Yes, Accept" : "Yes, Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

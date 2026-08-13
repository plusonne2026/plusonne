"use client";

import React, { useState, useEffect } from "react";
import { BookingAPI, BookingRequest as APIBookingRequest } from "@/app/lib/api/booking.api";
import {
  CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Calendar,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/lib/context/AuthContext";
import LiveChatModal from "@/app/components/session/LiveChatModal";

export default function HostSchedulePage() {
  const [bookings, setBookings] = useState<APIBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeChatBooking, setActiveChatBooking] = useState<APIBookingRequest | null>(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await BookingAPI.getMyBookings("host");
      // Filter out pending_match since they go to requests page, and cancelled since they are history
      const schedule = data.filter((b: APIBookingRequest) => 
        ["host_confirmed", "active", "completed"].includes(b.status)
      );
      setBookings(schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await BookingAPI.updateStatus(id, newStatus as any);
      setBookings((prev) => 
        prev.map((b) => (b.id || b.bookingId) === id ? { ...b, status: newStatus as any } : b)
      );
      toast.success("Booking status updated.");
    } catch (err) {
      toast.error("Failed to update booking status.");
    }
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your upcoming and active bookings.</p>
        </div>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <div className="p-12 rounded-[32px] bg-[#0D111A] border border-white/[0.08] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white">No Upcoming Bookings</h3>
            <p className="text-zinc-400 mt-2">When you accept a request, it will appear here.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const reqId = booking.id || booking.bookingId;
            const isConfirmed = booking.status === "host_confirmed";
            const isActive = booking.status === "active";
            const isCompleted = booking.status === "completed";

            return (
              <div
                key={reqId}
                className={`p-6 sm:p-8 rounded-[32px] border transition-colors shadow-2xl relative overflow-hidden group ${
                  isActive ? "bg-indigo-950/20 border-indigo-500/30" : 
                  isCompleted ? "bg-[#0D111A] border-emerald-500/10 opacity-75" : 
                  "bg-[#0D111A] border-white/[0.08]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Client Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.clientAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt={booking.clientName}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/[0.1]"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0098FF]/20 text-[#0098FF] border border-[#0098FF]/40 text-[10px] font-black uppercase tracking-wider inline-block">
                          {booking.category}
                        </span>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse inline-block">
                            Active
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider inline-block">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white">{booking.clientName}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-zinc-500" /> {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-zinc-500" /> {booking.time} ({booking.duration})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {!isCompleted && (
                        <button
                          onClick={() => setActiveChatBooking(booking)}
                          className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-black text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <MessageSquare className="w-4 h-4" /> Chat
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleUpdateStatus(reqId as string, "active")}
                          className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                        >
                          <PlayCircle className="w-4 h-4" /> Start Session
                        </button>
                      )}
                      
                      {isActive && (
                        <button
                          onClick={() => handleUpdateStatus(reqId as string, "completed")}
                          className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Complete Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="line-clamp-1">{booking.location}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Modal */}
      {activeChatBooking && (
        <LiveChatModal
          bookingId={activeChatBooking.id || activeChatBooking.bookingId}
          currentUserId={user?.id || "host"}
          currentUserName={user?.name || "Host"}
          otherPartyName={activeChatBooking.clientName}
          isOpen={!!activeChatBooking}
          onClose={() => setActiveChatBooking(null)}
        />
      )}
    </div>
  );
}

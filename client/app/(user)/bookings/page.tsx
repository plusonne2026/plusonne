"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingAPI, BookingRequest as APIBookingRequest } from "@/app/lib/api/booking.api";
import {
  CalendarIcon,
  MapPin,
  Clock,
  IndianRupee,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  PlayCircle
} from "lucide-react";
import { useAuth } from "@/app/lib/context/AuthContext";
import Link from "next/link";

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<APIBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/auth/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, router]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await BookingAPI.getMyBookings('user');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending_match":
      case "pending":
        return { label: "Searching for Host", icon: Clock3, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
      case "host_confirmed":
      case "accepted":
        return { label: "Host Assigned", icon: CheckCircle2, color: "text-[#0098FF]", bg: "bg-[#0098FF]/10 border-[#0098FF]/20" };
      case "in_session":
      case "active":
        return { label: "Session Active", icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
      case "completed":
        return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
      case "cancelled":
      case "declined":
        return { label: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" };
      default:
        return { label: status.replace("_", " "), icon: Clock3, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#06080D] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">My Bookings</h1>
          <p className="text-zinc-400">View and track all your companionship sessions.</p>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="p-12 rounded-[32px] bg-[#131824] border border-white/[0.05] flex flex-col items-center justify-center text-center shadow-xl">
              <CalendarIcon className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-xl font-black text-white">No Bookings Yet</h3>
              <p className="text-zinc-400 mt-2 mb-6 max-w-sm">You haven't booked any companionship sessions yet. Explore our packages and find your perfect PlusOne today.</p>
              <Link href="/packages" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] text-white font-bold text-sm">
                Explore Packages
              </Link>
            </div>
          ) : (
            bookings.map((booking) => {
              const statusInfo = getStatusDisplay(booking.status);
              const StatusIcon = statusInfo.icon;
              return (
                <Link
                  href={`/bookings/${booking.id || booking.bookingId}`}
                  key={booking.id || booking.bookingId}
                  className="block p-6 sm:p-8 rounded-[32px] bg-[#131824] border border-white/[0.05] hover:border-[#0098FF]/30 transition-all shadow-xl hover:shadow-2xl group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    
                    {/* Booking Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color} text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ID: {(booking.id || booking.bookingId).substring(0, 8)}</span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-black text-white capitalize mb-1">{booking.category.replace("_", " ")}</h3>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-semibold text-zinc-400">
                        <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                          <CalendarIcon className="w-4 h-4 text-zinc-500" /> {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                          <Clock className="w-4 h-4 text-zinc-500" /> {booking.time} ({booking.duration})
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                          <IndianRupee className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-400">{booking.payout}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-zinc-500">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="line-clamp-1">{booking.location}</span>
                      </div>
                    </div>

                    {/* Arrow / Action */}
                    <div className="flex items-center justify-end sm:pl-6 sm:border-l border-white/[0.05]">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-[#0098FF] group-hover:border-[#0098FF] group-hover:text-white flex items-center justify-center text-zinc-500 transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

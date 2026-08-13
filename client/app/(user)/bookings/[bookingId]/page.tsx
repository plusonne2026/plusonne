"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingAPI, BookingRequest as APIBookingRequest } from "@/app/lib/api/booking.api";
import { useAuth } from "@/app/lib/context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  CalendarIcon,
  Clock,
  IndianRupee,
  Phone,
  MessageCircle,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Navigation,
  Star
} from "lucide-react";
import Link from "next/link";
import LiveSessionMap from "@/app/components/session/LiveSessionMap";
import SOSOverlay from "@/app/components/ui/SOSOverlay";
import LiveChatModal from "@/app/components/session/LiveChatModal";

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [booking, setBooking] = useState<APIBookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSOSOverlay, setShowSOSOverlay] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  const handleTriggerSOS = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          location: { lat: 28.6139, lng: 77.2090, accuracy: 10 },
          emergencyNumber: "112"
        })
      });
      setShowSOSOverlay(true);
    } catch (err) {
      console.error("SOS Trigger failed", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/auth/login");
      return;
    }
    fetchBookingDetails();
  }, [isAuthenticated, bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // In a real app, there would be a getBookingById API. For MVP, we get all and filter.
      const data = await BookingAPI.getMyBookings('user');
      const found = data.find(b => (b.id === bookingId || b.bookingId === bookingId));
      if (found) {
        setBooking(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasHostAssigned = ["accepted", "host_confirmed", "active", "in_session", "completed"].includes(booking?.status || "");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#06080D] pt-28 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-black text-white mb-2">Booking Not Found</h2>
        <p className="text-zinc-400 mb-6">The booking you are looking for does not exist or you don't have access.</p>
        <button onClick={() => router.push("/bookings")} className="px-6 py-3 bg-white/[0.05] rounded-xl text-white font-bold hover:bg-white/[0.1]">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080D] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/bookings" className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white hover:bg-white/[0.1] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight capitalize">{booking.category.replace("_", " ")}</h1>
            <p className="text-sm text-zinc-400">ID: {(booking.id || booking.bookingId).substring(0, 8)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Details & Host */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Host Info Box */}
            <div className="p-6 rounded-[32px] bg-[#131824] border border-white/[0.05] shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">Your PlusOne Host</h3>
              
              {hasHostAssigned ? (
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <img src={booking.hostAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt="Host" className="w-16 h-16 rounded-full object-cover border-2 border-[#0098FF]" />
                    <div>
                      <h4 className="text-xl font-black text-white">{booking.hostName || "Verified Host"}</h4>
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-400 mt-1">
                        <Star className="w-4 h-4 fill-amber-400" /> 4.9 (124 reviews)
                      </div>
                    </div>
                  </div>
                  {booking?.status !== "completed" && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 rounded-xl bg-[#0098FF]/10 text-[#0098FF] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0098FF]/20 transition-colors">
                        <Phone className="w-4 h-4" /> Call
                      </button>
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="flex-1 py-3 rounded-xl bg-white/[0.05] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Searching for the perfect host</p>
                  <p className="text-xs text-zinc-400">We are matching your request with available verified hosts nearby.</p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="p-6 rounded-[32px] bg-[#131824] border border-white/[0.05] shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Booking Summary</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold">Date</p>
                  <p className="text-sm font-bold text-white">{booking.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold">Time & Duration</p>
                  <p className="text-sm font-bold text-white">{booking.time} ({booking.duration})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-semibold">Total Paid</p>
                  <p className="text-sm font-black text-emerald-400">₹{booking.payout}</p>
                </div>
              </div>

              {/* SOS Button */}
              {hasHostAssigned && (
                <div className="pt-4 mt-2 border-t border-white/[0.05]">
                  <button 
                    onClick={handleTriggerSOS}
                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" /> Trigger Emergency SOS
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live Map Tracking */}
          <div className="lg:col-span-2">
            <div className="h-full min-h-[500px] rounded-[32px] bg-[#131824] border border-white/[0.05] shadow-xl overflow-hidden flex flex-col relative">
              
              {/* Fake Map UI for MVP */}
              <div className="absolute inset-0 bg-[#0A0D14] bg-[radial-gradient(#1A2133_1px,transparent_1px)] [background-size:20px_20px] opacity-50 z-0"></div>
              
              <div className="absolute inset-0 flex items-center justify-center z-0">
                {hasHostAssigned ? (
                  <div className="absolute inset-0">
                    <LiveSessionMap 
                      userCoords={{ lat: 28.6120, lng: 77.2100 }} // Simulated
                      hostCoords={{ lat: 28.6250, lng: 77.2250 }} // Simulated
                      clientName={booking.hostName || "Host"}
                      locationName={booking.location}
                    />
                  </div>
                ) : (
                  <div className="text-center text-zinc-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">Map unavailable</p>
                    <p className="text-sm">Map tracking will start once a host accepts your request.</p>
                  </div>
                )}
              </div>

              {/* Location Card Overlay */}
              <div className="relative z-10 mt-auto p-6 m-4 rounded-2xl bg-[#181E2D]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Pickup Location</h4>
                    <p className="text-base font-extrabold text-white">{booking.location}</p>
                    {hasHostAssigned && (
                      <p className="text-sm text-[#0098FF] font-bold mt-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Host is approx. 12 mins away
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      {showSOSOverlay && (
        <SOSOverlay 
          bookingId={bookingId as string} 
          onCancel={() => setShowSOSOverlay(false)} 
        />
      )}

      {booking && (
        <LiveChatModal 
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          bookingId={bookingId as string}
          currentUserId={localStorage.getItem("userId") || "user_unknown"}
          currentUserName={booking.clientName || "User"}
          otherPartyName={booking.hostName || "Host"}
        />
      )}
    </div>
  );
}

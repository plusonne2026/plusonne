"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { AuthAPI, CompleteProfileRequest } from "../../lib/api/auth.api";
import { BookingAPI, BookingRequest } from "../../lib/api/booking.api";
import { useRouter } from "next/navigation";
import { Loader2, Camera, User, Mail, MapPin, Calendar, Clock, ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  
  const [formData, setFormData] = useState<CompleteProfileRequest>({
    displayName: "",
    city: "",
    avatarUrl: "",
    preferredLanguages: [],
  });

  const [history, setHistory] = useState<BookingRequest[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setFormData({
      displayName: user.displayName || "",
      city: user.city || "",
      avatarUrl: user.avatarUrl || "",
      preferredLanguages: user.preferredLanguages || ["English"],
    });

    fetchHistory();
  }, [user, router]);

  const fetchHistory = async () => {
    try {
      const data = await BookingAPI.getMyBookings("user");
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedUser = await AuthAPI.completeProfile(user.id, formData);
      toast.success("Profile updated successfully!");
      // Re-login to update context (mock behavior to refresh user state)
      const token = await user.getIdToken();
      await login(token);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0098FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-outfit pb-20">
      <header className="sticky top-0 z-50 bg-[#030305]/80 backdrop-blur-md border-b border-white/[0.05] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-[32px] bg-[#0A0D14] border border-white/[0.08] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0098FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center relative">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white/50" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0098FF] text-white shadow-lg hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center md:text-left z-10">
            <h2 className="text-2xl font-black text-white">{user?.displayName || "PlusOne User"}</h2>
            <p className="text-zinc-400 mt-1 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-white/[0.05] mb-8">
          <button 
            onClick={() => setActiveTab("details")}
            className={`pb-4 font-bold text-sm px-2 transition-colors relative ${activeTab === 'details' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Personal Details
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0098FF] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`pb-4 font-bold text-sm px-2 transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Booking History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0098FF] rounded-t-full"></div>}
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Display Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-black/50 border border-white/[0.05] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#0098FF] focus:ring-1 focus:ring-[#0098FF] transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">City</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-black/50 border border-white/[0.05] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#0098FF] focus:ring-1 focus:ring-[#0098FF] transition-all"
                    placeholder="E.g. Mumbai, Delhi"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-[#0098FF] text-white font-bold flex items-center gap-2 hover:bg-[#007acc] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Bookings Yet</h3>
                <p className="text-sm text-zinc-500">You haven't made any bookings. Start exploring hosts!</p>
              </div>
            ) : (
              history.map((booking) => {
                const reqId = booking.id || booking.bookingId;
                const isCompleted = booking.status === "completed";
                const isActive = booking.status === "active";

                return (
                  <Link href={`/bookings/${reqId}`} key={reqId} className="block">
                    <div className="p-4 sm:p-6 rounded-2xl bg-[#0A0D14] border border-white/[0.08] hover:border-white/[0.2] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <img 
                          src={booking.hostAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"} 
                          className="w-14 h-14 rounded-full object-cover border border-white/[0.1]" 
                          alt="Host"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#0098FF] uppercase">{booking.category}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                              isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                              isActive ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse" :
                              "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}>
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-white">{booking.hostName}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-400 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-zinc-500 font-medium mb-1">Total Paid</p>
                        <p className="text-lg font-black text-emerald-400">₹{booking.payout}</p>
                      </div>

                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

      </main>
    </div>
  );
}

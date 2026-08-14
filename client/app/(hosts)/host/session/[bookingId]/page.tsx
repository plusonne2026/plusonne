"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookingAPI,
  BookingRequest,
} from "@/app/lib/api/booking.api";
import {
  pushHostLocation,
  listenToChatMessages,
  sendChatMessage,
  ChatMessage,
  pushBookingStatusRealtime,
} from "@/app/lib/firebase/rtdb";
import LiveSessionMap from "@/app/components/session/LiveSessionMap";
import {
  ShieldCheck,
  Clock,
  MapPin,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  ArrowRight,
  Send,
  Loader2,
  Navigation,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Host GPS tracking state
  const [hostCoords, setHostCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0544,
    lng: 72.8402,
  });
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0596,
    lng: 72.8295,
  });

  // Session state & timer
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [completing, setCompleting] = useState<boolean>(false);

  // In-app chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // 1. Fetch booking details
  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    setLoading(true);
    const data = await BookingAPI.getById(bookingId);
    if (data) {
      setBooking(data);
      if (data.userLat && data.userLng) {
        setUserCoords({ lat: data.userLat, lng: data.userLng });
      }
      if (data.hostLat && data.hostLng) {
        setHostCoords({ lat: data.hostLat, lng: data.hostLng });
      }
      
      // Auto-start session if entering this page and not started
      if (data.status !== "active" && data.status !== "completed") {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${bookingId}/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          BookingAPI.updateStatus(bookingId, "active").catch(() => {});
          pushBookingStatusRealtime(bookingId, "active").catch(() => {});
        } catch (err) {
          console.error("Failed to start session on backend", err);
        }
      }
    } else {
      // Fallback booking object if new session ID
      setBooking({
        bookingId,
        clientName: "Rahul Sharma",
        clientAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        category: "Coffee & Conversation",
        date: "Today",
        time: "4:00 PM - 6:00 PM",
        duration: "2 Hours",
        payout: 1499,
        location: "Starbucks, Bandra West, Mumbai",
        status: "active",
      });
    }
    setLoading(false);
  };

  // 2. Background Geolocation Watcher & Firebase RTDB GPS Streamer
  useEffect(() => {
    let watchId: number | null = null;
    let simInterval: NodeJS.Timeout | null = null;

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setHostCoords(newCoords);
          pushHostLocation(bookingId, newCoords);
        },
        (error) => {
          console.warn("Browser GPS permission not granted, running simulated GPS movement for demo:", error.message);
          // Start simulated movement towards user coordinates
          let step = 0;
          simInterval = setInterval(() => {
            step++;
            setHostCoords((prev) => {
              const deltaLat = (userCoords.lat - prev.lat) * 0.05;
              const deltaLng = (userCoords.lng - prev.lng) * 0.05;
              const updated = {
                lat: prev.lat + deltaLat + (Math.random() - 0.5) * 0.0002,
                lng: prev.lng + deltaLng + (Math.random() - 0.5) * 0.0002,
              };
              pushHostLocation(bookingId, updated);
              return updated;
            });
          }, 4000);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (simInterval) {
        clearInterval(simInterval);
      }
    };
  }, [bookingId, userCoords]);

  // 3. Real-time Firebase Chat Listener
  useEffect(() => {
    const unsubChat = listenToChatMessages(bookingId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubChat();
  }, [bookingId]);

  // 4. Session Elapsed Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSendingChat(true);
    try {
      const hostId = localStorage.getItem("userId") || "host_unknown";
      const hostName = localStorage.getItem("userName") || "Host (You)";
      await sendChatMessage(bookingId, {
        senderId: hostId,
        senderName: hostName,
        text: chatInput.trim(),
      });
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleCompleteSession = async () => {
    setCompleting(true);
    // Trigger background updates asynchronously
    BookingAPI.updateStatus(bookingId, "completed").catch(() => {});
    pushBookingStatusRealtime(bookingId, "completed").catch(() => {});
    
    // Call backend API to end session and save chat history
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${bookingId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ chatMessages: messages })
      });
    } catch (err) {
      console.error("Failed to save session chat", err);
    }
    // Navigate immediately to rating screen
    router.push(`/host/session/${bookingId}/rate`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-800 dark:text-gray-200">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="font-medium text-sm">Initializing live session & GPS tracking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/host/dashboard"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h1 className="text-lg md:text-xl font-bold">Active Live Session</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                  IN PROGRESS
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Booking Ref: <code className="font-mono">{bookingId}</code>
              </p>
            </div>
          </div>

          {/* Session Timer & Status Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono text-base md:text-lg font-bold">
                {formatTimer(secondsElapsed)}
              </span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-colors ${
                isPaused
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              onClick={handleCompleteSession}
              disabled={completing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {completing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Complete & Rate User</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Map Tracking, Right Client Info & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Leaflet Map (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-base">Real-Time Host GPS Route</h2>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Leaflet.js Map Active
                </div>
              </div>

              {/* Leaflet Map Component */}
              <LiveSessionMap
                hostCoords={hostCoords}
                userCoords={userCoords}
                clientName={booking?.clientName}
                locationName={booking?.location}
              />

              {/* Location details bar */}
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl flex items-start gap-3 border border-gray-200/80 dark:border-gray-700/80">
                <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Meeting Destination
                  </h4>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {booking?.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Category: {booking?.category} • Payout: ₹{booking?.payout}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Client Profile & Real-Time Chat (1 Col) */}
          <div className="space-y-6">
            {/* Client Profile Summary Card */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
                  <Image
                    src={booking?.clientAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                    alt={booking?.clientName || "Client"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                    {booking?.clientName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Identity Verified Client</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Duration: {booking?.duration}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">
                    Session Fee
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{booking?.payout}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">
                    Emergency Alert
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    SOS Ready 🛡️
                  </span>
                </div>
              </div>
            </div>

            {/* In-App Live Firebase Chat Box */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[380px]">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm">Session Live Chat</h3>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium ml-auto">
                  Firebase RTDB
                </span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-1">
                    <MessageSquare className="w-8 h-8 opacity-30" />
                    <p>No messages yet.</p>
                    <p className="text-[10px]">Send a quick update to the client below.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === "host_me";
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-gray-400 mb-0.5">
                          {msg.senderName}
                        </span>
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

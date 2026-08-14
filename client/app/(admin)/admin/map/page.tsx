"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "@/app/lib/api/admin.api";
import { Map, Navigation, Loader2, MapPin, Search } from "lucide-react";

export default function AdminMapPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getActiveSessions();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch active sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-outfit">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-[#0098FF]" />
            Global GPS Monitoring
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
            Live telemetry and location tracking for all ongoing sessions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0098FF]/10 border border-[#0098FF]/20 text-[#0098FF] px-4 py-2 rounded-xl text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-[#0098FF] animate-pulse" />
          {sessions.length} Active Sessions
        </div>
      </div>

      <div className="bg-[#111624] border border-white/10 rounded-3xl p-6 relative min-h-[500px]">
        {loading && sessions.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#0098FF] mb-4" />
            <p>Syncing global telemetry...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-center px-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <Navigation className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Active Sessions</h2>
            <p className="text-zinc-400">There are currently no ongoing sessions to monitor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div key={session.bookingId} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-[#0098FF]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider">Live</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-xs">ID: {session.bookingId.substring(0,8)}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs font-semibold mb-1">Host Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-white">{session.hostLocation?.address || "Location streaming..."}</p>
                    </div>
                    {session.hostLocation?.lat && (
                      <p className="text-zinc-500 text-xs font-mono mt-1 ml-6">
                        {session.hostLocation.lat.toFixed(4)}, {session.hostLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs font-semibold mb-1">Client Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#0098FF] shrink-0 mt-0.5" />
                      <p className="text-sm text-white">{session.clientLocation?.address || "Location streaming..."}</p>
                    </div>
                    {session.clientLocation?.lat && (
                      <p className="text-zinc-500 text-xs font-mono mt-1 ml-6">
                        {session.clientLocation.lat.toFixed(4)}, {session.clientLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Host: <span className="text-white font-medium">{session.hostId}</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Client: <span className="text-white font-medium">{session.userId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

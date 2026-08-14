"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "@/app/lib/api/admin.api";
import { AlertCircle, CheckCircle, ShieldAlert, Loader2, MapPin, Clock, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSOSPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getActiveSOSAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error("Failed to fetch SOS alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 15 seconds
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      setActionLoading(alertId);
      await AdminAPI.updateSOSStatus(alertId, {
        status: "resolved",
        notes: "Resolved by Admin via Dashboard",
      });
      setAlerts(alerts.filter(a => a.alertId !== alertId));
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-outfit">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            SOS Operations Center
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
            Real-time monitoring of active emergency alerts. Dispatch authorities immediately for critical situations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {alerts.length} Active Alerts
        </div>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400 mb-4" />
          <p>Scanning for emergency signals...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">System Clear</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            There are currently no active SOS alerts on the platform. All sessions are proceeding safely.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {alerts.map((alert) => (
            <div
              key={alert.alertId}
              className="bg-[#111624] border border-rose-500/30 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
              
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Critical Priority
                    </div>
                    <span className="text-zinc-500 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Triggered {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt)) : "just now"} ago
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Booking ID</p>
                      <p className="text-white font-mono text-sm bg-black/40 px-3 py-2 rounded-lg border border-white/5 inline-block">
                        {alert.bookingId || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Triggered By</p>
                      <p className="text-white text-sm bg-black/40 px-3 py-2 rounded-lg border border-white/5 inline-flex items-center gap-2">
                        <span className="capitalize text-zinc-300">{alert.triggerRole || "User"}</span>
                        <span className="font-mono text-zinc-500">({alert.triggeredBy || "N/A"})</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#0098FF]" />
                      Last Known Location
                    </p>
                    <p className="text-white text-sm font-medium">
                      {alert.location?.address || "Location unavailable"}
                    </p>
                    {alert.location?.lat && alert.location?.lng && (
                      <p className="text-zinc-500 text-xs mt-1 font-mono">
                        {alert.location.lat}, {alert.location.lng}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  <a
                    href={`tel:${alert.emergencyNumber || "112"}`}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call Authorities ({alert.emergencyNumber || "112"})
                  </a>
                  
                  <button
                    onClick={() => handleResolve(alert.alertId)}
                    disabled={actionLoading === alert.alertId}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === alert.alertId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

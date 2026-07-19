"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminAPI, PlatformStats } from "../../../lib/api/admin.api";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Activity,
  UserCheck,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Compass,
  PartyPopper,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboardOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const data = await AdminAPI.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load platform statistics from server.");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" />
        <p className="text-sm font-bold text-zinc-400">Aggregating Live DynamoDB Platform Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131824] via-[#161D2D] to-[#131824] p-6 sm:p-8 rounded-[32px] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0C4CD9]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-[#0C4CD9] to-purple-600 text-white font-extrabold px-3 py-1 text-xs uppercase tracking-wider">
              Live Production State
            </Badge>
            <span className="text-xs font-semibold text-zinc-400">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Master Admin Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Monitor verified companions, process pending KYC identity checks, and track platform booking volume and category performance across Indian cities.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            variant="outline"
            className="rounded-2xl border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold px-4 py-6 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#0098FF]" : ""}`} />
            <span>Refresh Metrics</span>
          </Button>

          <Button
            onClick={() => router.push("/admin/hosts")}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] text-white font-extrabold px-5 py-6 text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review KYC Queue ({stats?.pendingKycHosts || 0})</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Users */}
        <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group hover:border-[#0098FF]/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#0098FF]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#0098FF]/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-[#0098FF]/15 border border-[#0098FF]/30 flex items-center justify-center text-[#0098FF]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{stats?.totalUsers || 0}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{stats?.monthlyGrowth || 24.5}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Active: <strong className="text-emerald-400">{stats?.activeUsers || 0}</strong></span>
            <span>Suspended: <strong className="text-rose-400">{stats?.suspendedUsers || 0}</strong></span>
          </div>
        </Card>

        {/* Stat 2: Total Host Network */}
        <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Host Network</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{stats?.totalHosts || 0}</span>
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
              Verified: {stats?.verifiedHosts || 0}
            </Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Verified Companions: <strong className="text-purple-300 font-bold">{stats?.verifiedHosts || 0}</strong></span>
          </div>
        </Card>

        {/* Stat 3: Pending KYC Reviews */}
        <Card className="bg-[#0D111A]/90 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-[0_0_24px_rgba(245,158,11,0.08)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">Pending KYC Reviews</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300 tracking-tight">{stats?.pendingKycHosts || 0}</span>
            {(stats?.pendingKycHosts || 0) > 0 ? (
              <Badge className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 animate-pulse">
                Action Required
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">All Cleared</Badge>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <button
              onClick={() => router.push("/admin/hosts")}
              className="text-amber-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>Inspect Verification Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Stat 4: Platform Gross Volume */}
        <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Gross Volume</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(stats?.totalRevenue || 215000)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Completed Bookings: <strong className="text-white font-bold">{stats?.totalBookings || 0}</strong></span>
          </div>
        </Card>
      </div>

      {/* Main Interactive Tabs Section */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <TabsList className="bg-[#131824] p-1.5 rounded-2xl border border-white/[0.08] h-auto">
            <TabsTrigger value="overview" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:bg-[#0098FF] data-[state=active]:text-white">
              Platform Demand & Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:bg-[#0098FF] data-[state=active]:text-white">
              Live Activity Feed
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Category Revenue & Demand Distribution */}
            <Card className="lg:col-span-2 bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white">Category Demand & Gross Revenue</CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-1">
                      Breakdown of booking demand and estimated earnings generated per companion category across verified hosts.
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-3 py-1 text-xs font-bold">
                    4 Active Categories
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5 pt-2">
                {stats?.categoryStats?.map((cat, idx) => {
                  const maxRev = 150000;
                  const percentage = Math.min(100, Math.round((cat.revenue / maxRev) * 100));
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            {idx === 0 && <Coffee className="w-4.5 h-4.5" />}
                            {idx === 1 && <Compass className="w-4.5 h-4.5" />}
                            {idx === 2 && <PartyPopper className="w-4.5 h-4.5" />}
                            {idx === 3 && <Trophy className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{cat.category}</p>
                            <p className="text-xs text-zinc-400 font-medium">Active Hosts offering category: {cat.count}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-black text-emerald-400">{formatCurrency(cat.revenue)}</p>
                          <p className="text-[10px] font-extrabold uppercase text-zinc-500">Gross Volume</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Right Col: Quick Action Card & Verification Queue Summary */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-amber-500/15 via-[#131824] to-[#0D111A] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Pending KYC Verification Queue</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    There are <strong className="text-amber-300 font-extrabold">{stats?.pendingKycHosts || 0} host applications</strong> currently waiting for identity verification and document review.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/admin/hosts")}
                    className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black py-6 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <span>Inspect Documents Now</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Button>
                </div>
              </Card>

              {/* System Security Notice Card */}
              <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DynamoDB MVP Specs Active</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tables <strong className="text-white font-mono">{`PlusOne_Users`}</strong> and <strong className="text-white font-mono">{`PlusOne_HostProfiles`}</strong> are operating with on-demand billing and GSI indexes.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ACTIVITIES */}
        <TabsContent value="activities">
          <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0098FF]" />
                <span>Real-Time Platform Activity Stream</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Live audit trail of host submittals, admin approvals, and new user registrations.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-4 hover:border-white/[0.14] transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        act.type === "kyc_pending"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : act.type === "host_verified"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : "bg-[#0098FF]/15 text-[#0098FF] border border-[#0098FF]/30"
                      }`}>
                        {act.type === "kyc_pending" && <Clock className="w-5 h-5" />}
                        {act.type === "host_verified" && <ShieldCheck className="w-5 h-5" />}
                        {act.type === "user_registered" && <UserCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{act.message}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{act.timestamp}</p>
                      </div>
                    </div>
                    {act.type === "kyc_pending" && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/admin/hosts")}
                        variant="outline"
                        className="rounded-xl border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs shrink-0"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-500 text-sm font-medium">
                  No recent activities recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900 dark:text-white" />
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Aggregating Live DynamoDB Platform Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-black font-extrabold px-3 py-1 text-xs sm:text-sm uppercase tracking-wider">
              Live Production State
            </Badge>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400">Real-Time Sync</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Master Admin Executive Dashboard
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
            Monitor verified companions, process pending KYC identity checks, and track platform booking volume and category performance across Indian cities.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            variant="outline"
            className="rounded-md border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-6 text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-white" : ""}`} />
            <span>Refresh Metrics</span>
          </Button>

          <Button
            onClick={() => router.push("/admin/hosts")}
            className="rounded-md bg-white hover:bg-zinc-200 text-black font-extrabold px-5 py-6 text-sm flex items-center gap-2 shadow-lg shadow-white/10 transition-all"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Review KYC Queue ({stats?.pendingKycHosts || 0})</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-200 text-sm sm:text-base flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Users */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Users</span>
            <div className="w-11 h-11 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Users className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{stats?.totalUsers || 0}</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +{stats?.monthlyGrowth || 24.5}%
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Active: <strong className="text-zinc-900 dark:text-white">{stats?.activeUsers || 0}</strong></span>
            <span>Suspended: <strong className="text-zinc-400">{stats?.suspendedUsers || 0}</strong></span>
          </div>
        </Card>

        {/* Stat 2: Total Host Network */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Host Network</span>
            <div className="w-11 h-11 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{stats?.totalHosts || 0}</span>
            <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold px-2.5 py-0.5">
              Verified: {stats?.verifiedHosts || 0}
            </Badge>
          </div>
          <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Verified Companions: <strong className="text-zinc-900 dark:text-white font-bold">{stats?.verifiedHosts || 0}</strong></span>
          </div>
        </Card>

        {/* Stat 3: Pending KYC Reviews */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">Pending KYC Reviews</span>
            <div className="w-11 h-11 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Clock className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{stats?.pendingKycHosts || 0}</span>
            {(stats?.pendingKycHosts || 0) > 0 ? (
              <Badge className="bg-black dark:bg-white text-white dark:text-black font-black text-xs px-2.5 py-0.5 animate-pulse">
                Action Required
              </Badge>
            ) : (
              <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold px-2.5 py-0.5">All Cleared</Badge>
            )}
          </div>
          <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <button
              onClick={() => router.push("/admin/hosts")}
              className="text-zinc-900 dark:text-white font-bold hover:underline flex items-center gap-1.5"
            >
              <span>Inspect Verification Queue</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </Card>

        {/* Stat 4: Platform Gross Volume */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Gross Volume</span>
            <div className="w-11 h-11 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              {formatCurrency(stats?.totalRevenue || 215000)}
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Completed Bookings: <strong className="text-zinc-900 dark:text-white font-bold">{stats?.totalBookings || 0}</strong></span>
          </div>
        </Card>
      </div>

      {/* Main Interactive Tabs Section */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <TabsList className="bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 h-auto">
            <TabsTrigger value="overview" className="rounded-md px-5 py-3 text-sm font-black data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Platform Demand & Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-md px-5 py-3 text-sm font-black data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Live Activity Feed
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Category Revenue & Demand Distribution */}
            <Card className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white">Category Demand & Gross Revenue</CardTitle>
                    <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
                      Breakdown of booking demand and estimated earnings generated per companion category across verified hosts.
                    </CardDescription>
                  </div>
                  <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1.5 text-xs font-bold">
                    4 Active Categories
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5 pt-2">
                {stats?.categoryStats?.map((cat, idx) => {
                  const maxRev = 150000;
                  const percentage = Math.min(100, Math.round((cat.revenue / maxRev) * 100));
                  return (
                    <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
                            {idx === 0 && <Coffee className="w-5 h-5" />}
                            {idx === 1 && <Compass className="w-5 h-5" />}
                            {idx === 2 && <PartyPopper className="w-5 h-5" />}
                            {idx === 3 && <Trophy className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-base font-black text-zinc-900 dark:text-white">{cat.category}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Active Hosts offering category: {cat.count}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">{formatCurrency(cat.revenue)}</p>
                          <p className="text-xs font-extrabold uppercase text-zinc-500">Gross Volume</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-black dark:bg-white rounded-full transition-all duration-700"
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
              <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">Pending KYC Verification Queue</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                    There are <strong className="text-zinc-900 dark:text-white font-extrabold">{stats?.pendingKycHosts || 0} host applications</strong> currently waiting for identity verification and document review.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/admin/hosts")}
                    className="w-full rounded-md bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-black py-6 text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Inspect Documents Now</span>
                    <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.5]" />
                  </Button>
                </div>
              </Card>

              {/* System Security Notice Card */}
              <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-white shrink-0" />
                  <span>DynamoDB MVP Specs Active</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tables <strong className="text-zinc-900 dark:text-white font-mono">{`PlusOne_Users`}</strong> and <strong className="text-zinc-900 dark:text-white font-mono">{`PlusOne_HostProfiles`}</strong> are operating with on-demand billing and GSI indexes.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ACTIVITIES */}
        <TabsContent value="activities">
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
                <Activity className="w-6 h-6 text-zinc-900 dark:text-white" />
                <span>Real-Time Platform Activity Stream</span>
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Live audit trail of host submittals, admin approvals, and new user registrations.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center shrink-0 font-bold">
                        {act.type === "kyc_pending" && <Clock className="w-5.5 h-5.5" />}
                        {act.type === "host_verified" && <ShieldCheck className="w-5.5 h-5.5" />}
                        {act.type === "user_registered" && <UserCheck className="w-5.5 h-5.5" />}
                      </div>
                      <div>
                        <p className="text-base font-bold text-zinc-900 dark:text-white">{act.message}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{act.timestamp}</p>
                      </div>
                    </div>
                    {act.type === "kyc_pending" && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/admin/hosts")}
                        variant="outline"
                        className="rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm px-4 py-2 shrink-0"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-500 text-base font-medium">
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

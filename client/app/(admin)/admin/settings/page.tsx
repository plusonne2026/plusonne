"use client";

import React from "react";
import {
  Settings,
  Database,
  Shield,
  Server,
  RefreshCw,
  CheckCircle2,
  Lock,
  Cpu,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131824] via-[#161D2D] to-[#131824] p-6 sm:p-8 rounded-[32px] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 text-xs font-black uppercase tracking-widest">
            System Diagnostics & Configuration
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Platform Settings & Architecture
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Verify AWS SDK v3 connection parameters, DynamoDB table mappings, and master admin authentication policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#0098FF]" />
              <span>AWS DynamoDB Connection Status</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Active parameters loaded from backend environment configuration (`env.js`).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#131824] border border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">Database Engine</span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs">
                AWS SDK v3 DynamoDB
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-[#131824] border border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">AWS Region</span>
              <span className="text-xs font-mono font-bold text-white">ap-south-1 (Mumbai / Local)</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#131824] border border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">Users Table Name</span>
              <span className="text-xs font-mono font-bold text-[#0098FF]">PlusOne_Users</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#131824] border border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">Host Profiles Table Name</span>
              <span className="text-xs font-mono font-bold text-purple-400">PlusOne_HostProfiles</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-black text-white flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Master Admin Seeding & Security</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Information on seeded credentials and role verification middleware.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Seeded Master Admin Credentials</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                To re-seed or reset admin accounts and sample hosts at any time, run:
              </p>
              <div className="p-3 rounded-xl bg-black/60 border border-purple-500/40 font-mono text-xs text-emerald-300">
                npm run seed:admin
              </div>
              <div className="text-[11px] text-zinc-400 pt-1">
                Email: <strong className="text-white">admin@plusone.com</strong> | Password: <strong className="text-white">Admin@123</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#131824] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Lock className="w-4 h-4 text-[#0098FF]" />
                <span>Role Verification Middleware Active</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All requests to <span className="font-mono text-white">/api/v1/admin/*</span> strictly pass through <span className="font-mono text-[#0098FF]">authenticate</span> and <span className="font-mono text-purple-300">requireRole(ROLES.ADMIN)</span> middleware.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

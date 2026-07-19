"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPageComponent() {
  const router = useRouter();
  const { loginWithAdmin } = useAuth();
  const [email, setEmail] = useState("admin@plusone.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickLoginSuccess, setQuickLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithAdmin(email, password);
      if (user.role !== "admin") {
        setError("Access Denied: This account does not have Master Admin privileges.");
        return;
      }
      setQuickLoginSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 600);
    } catch (err: any) {
      setError(err.message || "Admin login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail("admin@plusone.com");
    setPassword("Admin@123");
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithAdmin("admin@plusone.com", "Admin@123");
      setQuickLoginSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 600);
    } catch (err: any) {
      setError("Demo Admin login failed. Have you ran 'npm run seed:admin' yet?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center font-outfit relative overflow-hidden px-4 py-12">
      {/* Luxury Glow Background Effects */}
      <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#0C4CD9]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-[#9B51E0]/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="mb-8 text-center z-10">
        <div
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-3 cursor-pointer group select-none mb-3"
        >
          <Image
            src="/PlusOnne%20Logo%20PNG.png"
            alt="PlusOnne Logo"
            width={48}
            height={48}
            className="h-11 w-auto object-contain drop-shadow-[0_0_16px_rgba(12,76,217,0.6)] group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
              PlusOnne
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Master Admin Command Center
          </Badge>
        </div>
      </div>

      {/* Main Admin Login Card */}
      <Card className="w-full max-w-md bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 relative overflow-hidden">
        {/* Subtle Top Border Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#9B51E0]" />

        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0C4CD9] via-[#0098FF] to-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-[#0098FF]/30">
            <KeyRound className="w-8 h-8 stroke-[2.2]" />
          </div>
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Restricted Admin Portal
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
            Authorized personnel only. Access live metrics, KYC document reviews, and platform user oversight.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-200 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          {quickLoginSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Authentication Verified</h4>
              <p className="text-xs text-zinc-400">Initializing Admin Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0098FF]" />
                  <span>Admin Email</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@plusone.com"
                  className="bg-[#131824] border-white/[0.08] focus:border-[#0098FF] rounded-2xl px-4 py-3 text-sm text-white h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0098FF]" />
                  <span>Master Password</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#131824] border-white/[0.08] focus:border-[#0098FF] rounded-2xl px-4 py-3 text-sm text-white h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] hover:scale-[1.01] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0098FF]/25 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Quick Demo Login Option */}
          {!quickLoginSuccess && (
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">
                  Developer / Evaluator Quick Access
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full h-11 rounded-2xl border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/10"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Instant Login with Seeded Admin Credentials</span>
              </Button>
            </div>
          )}
        </CardContent>

        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5" />
            256-Bit Encrypted
          </span>
          <span>PlusOnne Security Shield</span>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/context/AuthContext";
import { setupRecaptcha } from "../../../lib/firebase/config";
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  User as UserIcon,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Briefcase,
  Star,
} from "lucide-react";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";

type ViewMode = "email_signin" | "email_signup" | "phone_otp";

export default function LoginPage() {
  const router = useRouter();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPhoneCode,
    confirmPhoneCode,
    isAuthenticated,
    user,
  } = useAuth();

  // Main UI Mode (Default: Email & Password Sign In)
  const [viewMode, setViewMode] = useState<ViewMode>("email_signin");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Phone OTP States
  const [phone, setPhone] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Email States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isVerified) {
        router.push("/home");
      } else {
        router.push("/auth/complete-profile");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    const formattedPhone = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
      }
      const result = await sendPhoneCode(formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      setCountdown(30);
    } catch (err: any) {
      console.error("Phone OTP Error:", err);
      if (
        err.code === "auth/invalid-phone-number" ||
        err?.message?.includes("firebase") ||
        err?.message?.includes("Recaptcha")
      ) {
        setError(err.message || "Failed to send OTP. Please check your phone number and try again.");
      } else {
        setError(err.message || "Failed to send OTP. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmationResult) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { user: profile, isNewUser } = await confirmPhoneCode(confirmationResult, otp);
      if (isNewUser || !profile.isVerified) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError("Invalid OTP entered. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user: profile, isNewUser } = await loginWithGoogle();
      if (isNewUser || !profile.isVerified) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message || "Google sign in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (viewMode === "email_signup") {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        const { user: profile, isNewUser } = await registerWithEmail(email, password, fullName);
        if (isNewUser || !profile.isVerified) {
          router.push("/auth/complete-profile");
        } else {
          router.push("/home");
        }
      } else {
        const profile = await loginWithEmail(email, password);
        if (!profile.isVerified) {
          router.push("/auth/complete-profile");
        } else {
          router.push("/home");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-outfit">
      {/* Background Radial Luxury Glows */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-[#0C4CD9]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-[#9B51E0]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl w-full bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        {/* Left Column: Brand Story & Value Props */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-b from-[#111624] via-[#0E131E] to-[#0A0D14] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between relative">
          <div>
            {/* Actual PlusOnne Logo & Brand Name */}
            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-3 mb-8 cursor-pointer group select-none"
            >
              <div className="relative flex items-center transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/PlusOnne%20Logo%20PNG.png"
                  alt="PlusOnne Logo"
                  width={52}
                  height={52}
                  priority
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(12,76,217,0.5)]"
                />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
                PlusOnne
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Your Companion. <br />
              <span className="bg-gradient-to-r from-[#FF6A3D] via-[#FF4E6E] to-[#9B51E0] bg-clip-text text-transparent">
                Your Choice. Your Way.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              Experience India's premier verified companionship network. Curated packages, instant booking, and verified hosts near you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-[#0C4CD9]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#0098FF]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">100% Verified Companions</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Every companion undergoes rigorous government Aadhaar & AI identity checks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-[#9B51E0]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#9B51E0]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant & Transparent Matching</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Choose flexible pay-per-use units or monthly plans with zero hidden fees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>© 2026 PlusOnne India</span>
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
              Active across 12+ Cities
            </span>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-[#0D111A]/50">
          <div className="max-w-md mx-auto w-full">
            {/* Header Title based on Mode */}
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {viewMode === "email_signin" && "Welcome Back to PlusOnne"}
                {viewMode === "email_signup" && "Create Your PlusOnne Account"}
                {viewMode === "phone_otp" && "Login with Mobile OTP"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                {viewMode === "email_signin" && "Enter your registered email and password to securely sign in."}
                {viewMode === "email_signup" && "Join thousands of verified members exploring India right now."}
                {viewMode === "phone_otp" && "We'll send a 6-digit verification code to your mobile number."}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-fade-in shadow-lg shadow-rose-500/5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-0.5">Authentication Note</p>
                  <p className="text-rose-300/90 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Recaptcha Invisible Container */}
            <div id="recaptcha-container" />

            {/* VIEW 1 & 2: Email Sign In / Sign Up */}
            {(viewMode === "email_signin" || viewMode === "email_signup") && (
              <form onSubmit={handleEmailSubmit} className="space-y-4.5">
                {viewMode === "email_signup" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="E.g. Shubham Mourya"
                        className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20 transition-all font-medium"
                        required={viewMode === "email_signup"}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Password
                    </label>
                    {viewMode === "email_signin" && (
                      <span
                        onClick={() =>
                          alert("Please use Google login or OTP verification if you forgot your email password.")
                        }
                        className="text-xs text-[#0098FF] hover:text-[#1C7AFF] cursor-pointer font-semibold transition-colors"
                      >
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:shadow-[#0098FF]/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{viewMode === "email_signup" ? "Creating Account..." : "Signing In..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{viewMode === "email_signup" ? "Register Account" : "Sign In with Email"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* VIEW 3: Phone OTP Form */}
            {viewMode === "phone_otp" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("email_signin");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0098FF] hover:text-white mb-5 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Email Sign In</span>
                </button>

                {!otpSent ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        Mobile Number
                      </label>
                      <div className="flex rounded-2xl overflow-hidden bg-[#131824] border border-white/[0.08] focus-within:border-[#0098FF] focus-within:ring-2 focus-within:ring-[#0098FF]/20 transition-all">
                        <div className="flex items-center gap-2 px-4 bg-[#181E2D] border-r border-white/[0.08] text-zinc-300 font-bold text-sm select-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          maxLength={10}
                          className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none tracking-wide font-medium"
                          required
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">
                        We will send a 6-digit verification code via SMS to this number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\D/g, "").length < 10}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:shadow-[#0098FF]/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-5 animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Enter 6-Digit OTP
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="text-xs text-[#0098FF] hover:text-white font-semibold underline transition-colors"
                        >
                          Change Number ({phone})
                        </button>
                      </div>

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • • • •"
                        maxLength={6}
                        className="w-full bg-[#131824] border border-white/[0.08] rounded-2xl px-4 py-4 text-center text-2xl sm:text-3xl font-black tracking-[0.4em] text-white placeholder:text-zinc-700 focus:border-[#0098FF] focus:outline-none focus:ring-2 focus:ring-[#0098FF]/20 transition-all"
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Verify & Proceed</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      {countdown > 0 ? (
                        <p className="text-xs text-zinc-500 font-medium">
                          Resend verification code in <span className="font-bold text-[#0098FF]">{countdown}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            handlePhoneSubmit({ preventDefault: () => {} } as any);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0098FF] hover:text-white transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Resend OTP Code</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-[#0D111A] px-4 text-zinc-500 font-bold">Or continue with</span>
              </div>
            </div>

            {/* Side-by-Side Buttons: Login with OTP & Login with Google */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setViewMode("phone_otp");
                  setError(null);
                }}
                disabled={loading}
                className="py-3.5 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.08] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Login with OTP</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="py-3.5 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.08] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Toggle: Sign In vs Register Account */}
            <div className="text-center mb-8">
              {viewMode === "email_signin" ? (
                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("email_signup");
                      setError(null);
                    }}
                    className="text-[#0098FF] hover:text-white font-extrabold underline transition-colors"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("email_signin");
                      setError(null);
                    }}
                    className="text-[#0098FF] hover:text-white font-extrabold underline transition-colors"
                  >
                    Sign In here
                  </button>
                </p>
              )}
            </div>

            {/* Apply for Host Luxury Banner Button */}
            <div className="pt-5 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => router.push("/host/apply")}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#1B1229] via-[#141829] to-[#101626] border border-purple-500/30 hover:border-purple-500/70 text-purple-200 text-xs sm:text-sm font-semibold flex items-center justify-between transition-all group shadow-lg hover:shadow-purple-500/15"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-white sm:text-sm">Apply for Host / Companion</p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300 uppercase">
                        High Earning
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Host unique experiences & earn up to ₹50,000/month</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-purple-500/20 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

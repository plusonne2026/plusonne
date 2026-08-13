"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/context/AuthContext";
import { HostAPI, HostRegistrationRequest, DaySchedule } from "../../../lib/api/host.api";
import { CategoriesAPI, Category } from "../../../lib/api/categories.api";
import { MediaAPI } from "../../../lib/api/media.api";
import { setupRecaptcha } from "../../../lib/firebase/config";
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Coffee,
  Compass,
  Trophy,
  PartyPopper,
  Calendar,
  CreditCard,
  FileCheck,
  Languages,
  User,
  AlertCircle,
  Check,
  Phone,
  Mail,
  Lock,
  RefreshCw,
  Building2,
  Banknote,
  Clock,
  ChevronRight,
  Upload,
} from "lucide-react";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";

const ICON_MAP: Record<string, any> = {
  Coffee,
  Compass,
  Trophy,
  PartyPopper,
  Sparkles,
};

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Punjabi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "French",
  "Spanish",
];

const DAYS_OF_WEEK = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
  { id: 0, name: "Sunday", short: "Sun" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", time: "09:00 - 13:00" },
  { id: "afternoon", label: "Afternoon", time: "13:00 - 18:00" },
  { id: "evening", label: "Evening", time: "18:00 - 22:00" },
];

export default function HostApplyPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPhoneCode,
    confirmPhoneCode,
    refreshProfile,
  } = useAuth();

  // Wizard Step: 0 (Direct Login/Signup if not auth) | 1 to 7 (Steps) | 8 (Success)
  const [step, setStep] = useState<number>(isAuthenticated ? 1 : 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Load categories from DB
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await CategoriesAPI.getAll();
        const formattedCats = cats.map(c => ({
          id: c.categoryId,
          name: c.name,
          desc: c.description,
          icon: ICON_MAP[c.iconUrl] || Sparkles,
          color: "from-[#0098FF] to-[#1C7AFF]",
          rate: "₹1,500 / hr avg" // Fallback since DB doesn't have rate currently
        }));
        setDbCategories(formattedCats);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  // Sync step when user logs in at Step 0
  useEffect(() => {
    if (isAuthenticated && step === 0) {
      setStep(1);
    }
  }, [isAuthenticated, step]);

  // Step 0 Auth States (Direct Host Application)
  const [authMode, setAuthMode] = useState<"phone" | "google" | "email">("phone");
  const [phone, setPhone] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isNewAccount, setIsNewAccount] = useState<boolean>(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState<boolean>(false);

  // Step 1 States: Personal Info
  const [bio, setBio] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<number>(1);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  );

  // Step 2 States: Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["coffee_date"]);

  // Step 3 States: Languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English", "Hindi"]);

  // Step 4 States: Availability
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [selectedSlots, setSelectedSlots] = useState<Record<number, string[]>>({
    1: ["afternoon", "evening"],
    2: ["afternoon", "evening"],
    3: ["afternoon", "evening"],
    4: ["afternoon", "evening"],
    5: ["morning", "afternoon", "evening"],
    6: ["morning", "afternoon", "evening"],
    0: ["morning", "afternoon"],
  });

  // Step 5 States: KYC Documents
  const [aadhaarUrl, setAadhaarUrl] = useState<string>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
  const [panUrl, setPanUrl] = useState<string>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
  const [photoUrl, setPhotoUrl] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Step 6 States: Bank Account Details & Skip Option
  const [skipBankDetails, setSkipBankDetails] = useState<boolean>(false);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [ifsc, setIfsc] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>(user?.displayName || "");

  // Timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Category Toggle
  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== id));
      }
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  // Handle Language Toggle
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Handle Day Toggle
  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
      if (!selectedSlots[dayId] || selectedSlots[dayId].length === 0) {
        setSelectedSlots({ ...selectedSlots, [dayId]: ["afternoon", "evening"] });
      }
    }
  };

  // Handle Time Slot Toggle for a Day
  const toggleTimeSlot = (dayId: number, slotId: string) => {
    const current = selectedSlots[dayId] || [];
    if (current.includes(slotId)) {
      setSelectedSlots({ ...selectedSlots, [dayId]: current.filter((s) => s !== slotId) });
    } else {
      setSelectedSlots({ ...selectedSlots, [dayId]: [...current, slotId] });
    }
  };

  // Build Schedule payload
  const buildSchedulePayload = (): DaySchedule[] => {
    return selectedDays.map((dayId) => {
      const slotsForDay = selectedSlots[dayId] || ["afternoon"];
      const slots: { start: string; end: string }[] = slotsForDay.map((slotId) => {
        const found = TIME_SLOTS.find((ts) => ts.id === slotId);
        if (found) {
          const parts = found.time.split(" - ");
          return { start: parts[0], end: parts[1] };
        }
        return { start: "13:00", end: "18:00" };
      });
      return { dayOfWeek: dayId, slots };
    });
  };

  // Step 0 Auth Handlers
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
        recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container-host");
      }
      const result = await sendPhoneCode(formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      setCountdown(30);
    } catch (err: any) {
      setError(err.message || "Failed to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmationResult) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await confirmPhoneCode(confirmationResult, otp);
      setStep(1);
    } catch (err: any) {
      setError("Invalid OTP entered. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isNewAccount) {
        if (!fullName.trim()) {
          setError("Please provide your full name.");
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, fullName);
      } else {
        await loginWithEmail(email, password);
      }
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Final Submission Handler (Step 7)
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const schedulePayload = buildSchedulePayload();

      const payload: HostRegistrationRequest = {
        bio,
        categories: selectedCategories,
        languages: selectedLanguages,
        experienceYears,
        schedule: schedulePayload,
        kycDocuments: {
          aadhaarUrl,
          panUrl,
          photoUrl,
        },
        bankDetails: skipBankDetails
          ? null
          : {
              accountNumber,
              ifsc,
              accountHolderName: accountHolderName || user?.displayName || "Verified Host",
            },
      };

      await HostAPI.register(payload);
      await refreshProfile();
      setStep(8); // Celebration / Success Screen
    } catch (err: any) {
      console.error("Host registration error:", err);
      setError(err.message || "Failed to submit host application. Please check fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docTitle: string,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(docTitle);
      setError(null);
      const res = await MediaAPI.uploadFile(file, "plusone_kyc");
      setter(res.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload document to Cloudinary");
    } finally {
      setUploadingDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-outfit relative overflow-hidden">
      {/* Background Luxury Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0C4CD9]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-[#9B51E0]/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-white/[0.08] bg-[#0D111A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer group select-none">
            <Image
              src="/PlusOnne%20Logo%20PNG.png"
              alt="PlusOnne Logo"
              width={42}
              height={42}
              className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(12,76,217,0.5)] group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
                PlusOnne
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase tracking-widest">
                Host Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300">
                <span className="hidden sm:inline">Applying as:</span>
                <span className="text-[#0098FF] font-bold">{user?.displayName || user?.email || "Partner"}</span>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth/login")}
                className="text-xs sm:text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Sign In Existing Account
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center z-10">
        {/* Step Indicator Bar (Only show if authenticated and not in celebration screen) */}
        {step >= 1 && step <= 7 && (
          <div className="mb-10">
            <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold mb-3">
              <span className="text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Step {step} of 7
              </span>
              <span className="text-zinc-400">
                {step === 1 && "Personal Profile & Bio"}
                {step === 2 && "Select Service Categories"}
                {step === 3 && "Languages Spoken"}
                {step === 4 && "Availability Schedule"}
                {step === 5 && "KYC & Identity Verification"}
                {step === 6 && "Payout Bank Account Details"}
                {step === 7 && "Review & Submit Application"}
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#9B51E0] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,152,255,0.6)]"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-7 gap-1 mt-3">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  onClick={() => s < step && setStep(s)}
                  className={`flex items-center justify-center py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    step === s
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : s < step
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/[0.02] text-zinc-600 pointer-events-none"
                  }`}
                >
                  {s < step ? <Check className="w-3 h-3 stroke-[3]" /> : `0${s}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Application Notice</p>
              <p className="text-rose-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 0: DIRECT APPLICATION LOGIN / SIGNUP WIZARD */}
        {step === 0 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-12 shadow-2xl animate-fade-in max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <Briefcase className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Apply Directly as a Verified Companion
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Start earning up to <span className="text-emerald-400 font-bold">₹50,000+ per month</span> hosting curated coffee dates, city tours, and VIP experiences. Verify your phone or Google account right now to begin.
              </p>
            </div>

            <div id="recaptcha-container-host" />

            {/* Unified Auth Container adhering to user hierarchy */}
            <div className="space-y-6">
              {/* 1. DEFAULT: Email & Password Form */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0098FF]" />
                    <span>{isNewAccount ? "Register with Email & Password" : "Login with Email & Password"}</span>
                  </h3>
                  {isNewAccount && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      New Host Registration
                    </span>
                  )}
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isNewAccount && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isNewAccount ? "Create Account & Continue" : "Sign In & Continue"}</span>}
                  </button>
                </form>
              </div>

              {/* Divider below Email Form */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-white/[0.08] flex-1" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">
                  {isNewAccount ? "Or Register With" : "Or Login With"}
                </span>
                <div className="h-px bg-white/[0.08] flex-1" />
              </div>

              {/* 2. BELOW EMAIL: Login / Register with Mobile No. and Google */}
              <div className="space-y-3">
                {/* Mobile No Toggle / Section */}
                <button
                  type="button"
                  onClick={() => setShowPhoneLogin(!showPhoneLogin)}
                  className={`w-full py-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    showPhoneLogin
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                      : "bg-white/[0.05] border-white/[0.12] hover:bg-white/[0.1] text-white"
                  }`}
                >
                  <Phone className="w-4 h-4 text-[#0098FF]" />
                  <span>{showPhoneLogin ? "Hide Mobile OTP Form" : isNewAccount ? "Register with Mobile Number" : "Login with Mobile Number"}</span>
                </button>

                {/* Mobile OTP Form Inline when active */}
                {showPhoneLogin && (
                  <div className="p-5 rounded-3xl bg-[#131824]/90 border border-[#0098FF]/40 shadow-2xl animate-fade-in space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0098FF]">Mobile Verification</h4>
                    {!otpSent ? (
                      <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1.5">Enter Mobile Number</label>
                          <div className="flex rounded-2xl overflow-hidden bg-[#0D111A] border border-white/[0.12] focus-within:border-[#0098FF]">
                            <div className="flex items-center gap-2 px-4 bg-[#181E2D] border-r border-white/[0.12] text-zinc-300 font-bold text-sm select-none">
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </div>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="98765 43210"
                              maxLength={10}
                              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none font-medium"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={loading || phone.replace(/\D/g, "").length < 10}
                          className="w-full py-3.5 rounded-2xl bg-[#0098FF] hover:bg-[#0080DF] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#0098FF]/30 transition-all disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Verification Code</span>}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleOtpVerify} className="space-y-3.5 animate-fade-in">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-zinc-300">Enter 6-Digit Verification Code</label>
                            <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-[#0098FF] underline font-semibold">
                              Change Number ({phone})
                            </button>
                          </div>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="• • • • • •"
                            maxLength={6}
                            className="w-full bg-[#0D111A] border border-white/[0.12] rounded-2xl px-4 py-3.5 text-center text-3xl font-black tracking-[0.4em] text-white focus:border-[#0098FF] focus:outline-none"
                            required
                            autoFocus
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading || otp.length < 6}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /><span>Verify & Continue</span></>}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.1] text-white font-bold text-sm flex items-center justify-center gap-3 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{isNewAccount ? "Register with Google" : "Login with Google"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. BELOW ALL: Register / Login Option Switcher */}
              <div className="pt-4 mt-6 border-t border-white/[0.08] text-center">
                {!isNewAccount ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-zinc-300 font-medium">Don't have a host account yet?</span>
                    <button
                      type="button"
                      onClick={() => { setIsNewAccount(true); setShowPhoneLogin(false); setError(null); }}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 shrink-0"
                    >
                      Register as New Host
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-zinc-300 font-medium">Already registered as a host?</span>
                    <button
                      type="button"
                      onClick={() => { setIsNewAccount(false); setShowPhoneLogin(false); setError(null); }}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-extrabold text-xs uppercase tracking-wider transition-all shrink-0"
                    >
                      Sign In to Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                256-bit Secure Identity Check
              </span>
              <span>PlusOnne Companion Network</span>
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL PROFILE & BIO */}
        {step === 1 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">Personal Profile & Bio</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              Let potential guests know who you are, what makes hanging out with you memorable, and your hosting experience.
            </p>

            <div className="space-y-6">
              {/* Profile Avatar Upload Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#0098FF] shadow-lg shadow-[#0098FF]/20"
                  />
                  {uploadingDoc === "profile_avatar" && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0098FF]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white">Public Profile Photo</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Choose a clear, friendly smiling photo where your face is well-lit. Guests prefer verified, approachable photos.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] hover:scale-[1.02] text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-[#0098FF]/20">
                      {uploadingDoc === "profile_avatar" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploadingDoc === "profile_avatar" ? "Uploading Photo..." : "Upload Profile Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "profile_avatar", setAvatarUrl)}
                        className="hidden"
                        disabled={uploadingDoc === "profile_avatar"}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80")
                      }
                      className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-bold text-zinc-300 hover:text-white transition-all"
                    >
                      Use Demo Portrait
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Your Host Bio / Introduction
                  </label>
                  <span className={`text-xs font-bold ${bio.length < 20 ? "text-amber-400" : "text-emerald-400"}`}>
                    {bio.length} / 500 characters
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="E.g., Hey there! I'm an architect and lifelong city foodie. I love exploring heritage monuments, discovering cozy jazz cafes, and having engaging conversations over dinner. Whether you need a friendly city guide or an energetic tennis buddy, let's make your day unforgettable!"
                  rows={5}
                  className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl p-4 text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none leading-relaxed transition-all"
                />
                {bio.length > 0 && bio.length < 20 && (
                  <p className="text-xs text-amber-400 mt-1.5">Please write at least 20 characters describing your personality.</p>
                )}
              </div>

              {/* Experience Years Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Years of Hosting / Social Event Experience
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: 0, label: "Newcomer (0 yrs)" },
                    { val: 1, label: "1 Year" },
                    { val: 3, label: "2 - 3 Years" },
                    { val: 5, label: "4+ Years (Pro)" },
                  ].map((exp) => (
                    <button
                      key={exp.val}
                      type="button"
                      onClick={() => setExperienceYears(exp.val)}
                      className={`py-3.5 rounded-2xl border text-xs sm:text-sm font-extrabold transition-all ${
                        experienceYears === exp.val
                          ? "bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] border-transparent text-white shadow-lg shadow-[#0098FF]/25"
                          : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/[0.2] hover:text-white"
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                disabled={bio.trim().length < 20}
                onClick={() => setStep(2)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>Continue to Categories</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT SERVICE CATEGORIES */}
        {step === 2 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">Select Service Categories</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              Choose one or more companionship categories you want to host. You can customize pricing and preferences later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dbCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? "bg-white/[0.08] border-[#0098FF] shadow-[0_0_25px_rgba(0,152,255,0.2)]"
                        : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "bg-[#0098FF] border-[#0098FF] text-white" : "border-white/[0.2] text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white mb-1.5">{cat.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{cat.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-semibold">Expected Earnings:</span>
                      <span className="font-extrabold text-emerald-400">{cat.rate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={selectedCategories.length === 0}
                onClick={() => setStep(3)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>Continue to Languages</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LANGUAGES SPOKEN */}
        {step === 3 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">Languages Spoken</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              Select all languages you speak fluently or comfortably to connect with diverse guests from across India.
            </p>

            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`py-3 px-5 rounded-2xl border text-xs sm:text-sm font-extrabold flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? "bg-purple-500/20 border-purple-500/60 text-purple-200 shadow-lg shadow-purple-500/10"
                        : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/[0.2] hover:text-white"
                    }`}
                  >
                    <Languages className={`w-4 h-4 ${isSelected ? "text-purple-400" : "text-zinc-600"}`} />
                    <span>{lang}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={selectedLanguages.length === 0}
                onClick={() => setStep(4)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AVAILABILITY SCHEDULE */}
        {step === 4 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">Weekly Availability Schedule</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              Select which days of the week and time slots you generally prefer for hosting sessions. You can easily toggle online/offline at any time.
            </p>

            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const isDaySelected = selectedDays.includes(day.id);
                const slotsForDay = selectedSlots[day.id] || [];
                return (
                  <div
                    key={day.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDaySelected ? "bg-white/[0.04] border-white/[0.15]" : "bg-white/[0.01] border-white/[0.05] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isDaySelected}
                          onChange={() => toggleDay(day.id)}
                          className="w-5 h-5 rounded-lg border-white/[0.2] bg-[#131824] text-[#0098FF] focus:ring-[#0098FF]/20 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-white">{day.name}</span>
                      </div>
                      {isDaySelected && (
                        <div className="flex flex-wrap gap-2">
                          {TIME_SLOTS.map((ts) => {
                            const isSlotChecked = slotsForDay.includes(ts.id);
                            return (
                              <button
                                key={ts.id}
                                type="button"
                                onClick={() => toggleTimeSlot(day.id, ts.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                                  isSlotChecked
                                    ? "bg-[#0098FF]/20 text-[#0098FF] border border-[#0098FF]/40"
                                    : "bg-white/[0.05] text-zinc-500 border border-transparent hover:text-zinc-300"
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{ts.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={selectedDays.length === 0}
                onClick={() => setStep(5)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>Continue to KYC</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: KYC IDENTITY VERIFICATION */}
        {step === 5 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">KYC & Identity Verification</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              To ensure 100% trust and safety across the network, we verify government IDs before listing any companion profile.
            </p>

            <div className="space-y-4">
              {[
                { title: "Aadhaar Card (Front & Back)", url: aadhaarUrl, setter: setAadhaarUrl, desc: "UIDAI verified identity proof" },
                { title: "PAN Card", url: panUrl, setter: setPanUrl, desc: "Government tax verification proof" },
                { title: "Live Selfie Photo ID", url: photoUrl, setter: setPhotoUrl, desc: "Real-time face match with ID" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{doc.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{doc.url?.startsWith("data:") ? "Local Upload Ready" : doc.url?.includes("cloudinary.com") ? "Cloudinary Verified" : "Ready"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] hover:scale-[1.02] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0098FF]/20">
                      {uploadingDoc === doc.title ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploadingDoc === doc.title ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, doc.title, doc.setter)}
                        className="hidden"
                        disabled={uploadingDoc === doc.title}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all"
              >
                <span>Continue to Bank Details</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: BANK ACCOUNT DETAILS (WITH PROMINENT SKIP OPTION) */}
        {step === 6 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Payout Bank Account Details</h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Where you want your 70% session earnings deposited directly via fast IMPS/NEFT transfers.
                </p>
              </div>

              {/* Luxury Skip Toggle Card */}
              <button
                type="button"
                onClick={() => setSkipBankDetails(!skipBankDetails)}
                className={`px-5 py-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2.5 transition-all shadow-md shrink-0 ${
                  skipBankDetails
                    ? "bg-purple-500/20 border-purple-500 text-purple-200 shadow-purple-500/15"
                    : "bg-white/[0.06] border-white/[0.15] text-zinc-300 hover:border-white/[0.3] hover:text-white"
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${skipBankDetails ? "bg-purple-500 border-purple-500 text-white" : "border-zinc-500"}`}>
                  {skipBankDetails && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>Skip for Now (Add After Onboarding)</span>
              </button>
            </div>

            {skipBankDetails ? (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 via-[#131824] to-[#0D111A] border border-purple-500/30 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 mx-auto">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Bank Account Skipped for Initial Onboarding</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  No problem! You can complete your host application right now. You can securely add your payout account number and IFSC anytime from your <span className="text-purple-300 font-bold">Host Dashboard</span> before your first withdrawal.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Account Holder Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="As per bank records"
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Account Number</label>
                  <div className="relative">
                    <CreditCard className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 12345678901234"
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none tracking-wider font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">IFSC Code</label>
                  <div className="relative">
                    <Building2 className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      className="w-full bg-[#131824] border border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none font-mono uppercase font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!skipBankDetails && (!accountNumber || !ifsc || !accountHolderName)}
                onClick={() => setStep(7)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>Review Summary</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: FINAL REVIEW & SUBMISSION */}
        {step === 7 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-6 sm:p-10 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">Review & Submit Application</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8">
              Please check your application summary below before sending for final verification.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block font-semibold mb-1">Host Bio ({experienceYears} Yrs Experience)</span>
                  <p className="text-white font-medium leading-relaxed italic">"{bio}"</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-[#0098FF] font-bold underline shrink-0">Edit</button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block font-semibold mb-1">Selected Categories</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-[#0098FF]/20 text-[#0098FF] font-bold uppercase text-[11px]">
                        {c.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="text-[#0098FF] font-bold underline shrink-0">Edit</button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block font-semibold mb-1">Languages Spoken</span>
                  <p className="text-white font-bold">{selectedLanguages.join(", ")}</p>
                </div>
                <button type="button" onClick={() => setStep(3)} className="text-[#0098FF] font-bold underline shrink-0">Edit</button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block font-semibold mb-1">Weekly Availability</span>
                  <p className="text-white font-bold">{selectedDays.length} Days / Week Active</p>
                </div>
                <button type="button" onClick={() => setStep(4)} className="text-[#0098FF] font-bold underline shrink-0">Edit</button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block font-semibold mb-1">Bank Payout Account</span>
                  {skipBankDetails ? (
                    <span className="text-purple-300 font-extrabold bg-purple-500/20 px-2.5 py-1 rounded-lg">
                      Skipped for now (Will add from Dashboard)
                    </span>
                  ) : (
                    <p className="text-white font-mono font-bold">{accountNumber} ({ifsc})</p>
                  )}
                </div>
                <button type="button" onClick={() => setStep(6)} className="text-[#0098FF] font-bold underline shrink-0">Edit</button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="py-4 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="py-4 px-10 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirm & Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: CELEBRATION & APPLICATION UNDER REVIEW */}
        {step === 8 && (
          <div className="bg-[#0D111A]/85 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-8 sm:p-14 shadow-2xl text-center animate-fade-in max-w-2xl mx-auto w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase tracking-wider">
              Application Under Review
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-3 tracking-tight">
              Congratulations, {user?.displayName || "Companion"}! 🎉
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
              Your host profile and identity documents have been submitted to our verification team. Most applications are reviewed within <span className="text-white font-bold">24 hours</span>.
            </p>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-left space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#0098FF]/20 flex items-center justify-center text-[#0098FF] shrink-0 mt-0.5">
                  <span className="text-xs font-black">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI & Document Check</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Our automated AI verification is running checkups on your government Aadhaar and PAN IDs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <span className="text-xs font-black">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Profile Activation</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Once approved, your profile goes live instantly across your city and nearby users can book you!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => router.push("/host/dashboard")}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0098FF]/25 hover:scale-[1.02] transition-all"
              >
                <Briefcase className="w-4.5 h-4.5" />
                <span>Go to Host Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="py-4 px-8 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-sm transition-all"
              >
                Return to User Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookingAPI, BookingRequest } from "@/app/lib/api/booking.api";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Heart,
  Smile,
  Shield,
  Users,
  Send,
} from "lucide-react";

export default function PostSessionRatingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRequest | null>({
    bookingId,
    clientName: "Rahul Sharma",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    category: "Coffee & Conversation",
    date: "Today",
    time: "Completed Session",
    duration: "2 Hours",
    payout: 1499,
    location: "Starbucks, Bandra West, Mumbai",
    status: "completed",
  });
  const [loadingBooking, setLoadingBooking] = useState<boolean>(false);

  // 4 Evaluation Criteria states (1-5)
  const [behavior, setBehavior] = useState<number>(5);
  const [respect, setRespect] = useState<number>(5);
  const [safety, setSafety] = useState<number>(5);
  const [cooperation, setCooperation] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadBookingInfo();
  }, [bookingId]);

  const loadBookingInfo = async () => {
    try {
      const data = await BookingAPI.getById(bookingId);
      if (data) {
        setBooking(data);
      }
    } catch (e) {
      // Keep default booking
    }
  };

  const calculateOverall = () => {
    return ((behavior + respect + safety + cooperation) / 4).toFixed(1);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await BookingAPI.submitRating({
        bookingId,
        userId: booking?.userId || "usr_101",
        behavior,
        respect,
        safety,
        cooperation,
        reviewText,
      });
      setSubmitted(true);
      setTimeout(() => {
        router.push("/host/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("API submission failed:", err);
      setErrorMsg(err?.response?.data?.error || "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const CriteriaStarRating = ({
    label,
    icon: Icon,
    value,
    onChange,
    description,
  }: {
    label: string;
    icon: any;
    value: number;
    onChange: (val: number) => void;
    description: string;
  }) => (
    <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{label}</h4>
            <p className="text-[11px] text-gray-500">{description}</p>
          </div>
        </div>

        <span className="font-bold text-sm px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
          {value} / 5
        </span>
      </div>

      {/* Interactive Stars */}
      <div className="flex items-center gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loadingBooking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-800 dark:text-gray-200">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="font-medium text-sm">Preparing rating screen...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-900 dark:text-gray-100">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Feedback Submitted!</h2>
          <p className="text-sm text-gray-500">
            Thank you for rating <strong>{booking?.clientName}</strong>. Your feedback helps maintain a trustworthy PlusOne community.
          </p>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to Host Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/host/dashboard"
            className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Post-Session Two-Way Rating</h1>
            <p className="text-xs text-gray-500">
              Review client behavior, safety, respect, and cooperation
            </p>
          </div>
        </div>

        {/* Client info summary */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500">
              <Image
                src={
                  booking?.clientAvatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                }
                alt={booking?.clientName || "Client"}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-base">{booking?.clientName}</h3>
              <p className="text-xs text-gray-500">{booking?.category}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Session Completed • Payout ₹{booking?.payout}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 block uppercase font-semibold">Overall Rating</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {calculateOverall()} <span className="text-sm font-normal text-gray-400">/ 5</span>
            </span>
          </div>
        </div>

        {/* Form rating details */}
        <form onSubmit={handleSubmitRating} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-base border-b border-gray-100 dark:border-gray-800 pb-3">
              Evaluate Client Performance Across 4 Categories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CriteriaStarRating
                label="1. Behavior"
                icon={Smile}
                value={behavior}
                onChange={setBehavior}
                description="Politeness, attitude, and social conduct"
              />

              <CriteriaStarRating
                label="2. Respect"
                icon={Heart}
                value={respect}
                onChange={setRespect}
                description="Personal boundaries & mutual respect"
              />

              <CriteriaStarRating
                label="3. Safety"
                icon={Shield}
                value={safety}
                onChange={setSafety}
                description="Adherence to safety guidelines & public standards"
              />

              <CriteriaStarRating
                label="4. Cooperation"
                icon={Users}
                value={cooperation}
                onChange={setCooperation}
                description="Punctuality, communication, & meeting instructions"
              />
            </div>
          </div>

          {/* Written review feedback */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Detailed Written Feedback (Optional)
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details about your experience with this client..."
              className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Submit User Rating & Return to Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
}

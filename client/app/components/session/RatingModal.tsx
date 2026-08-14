"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api/client";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  hostId: string;
  hostName: string;
}

const PRESET_TAGS = ["Polite", "On Time", "Great Listener", "Fun", "Professional", "Good Guide"];

export default function RatingModal({ isOpen, onClose, bookingId, hostId, hostName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    
    setSubmitting(true);
    try {
      await apiClient.post("/ratings", {
        bookingId,
        targetUserId: hostId,
        rating,
        review,
        tags: selectedTags
      });
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={submitted ? undefined : onClose}></div>
      
      <div className="bg-[#0A0D14] w-full max-w-md rounded-[32px] border border-white/[0.08] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-white/[0.05] relative">
          {!submitted && (
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/5 text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-black text-white">Rate your experience</h2>
          <p className="text-sm text-zinc-400 mt-1">How was your session with {hostName}?</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Review Submitted!</h3>
              <p className="text-zinc-400 text-sm">Your feedback helps keep our community safe and high-quality.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600"
                      }`} 
                    />
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What went well?</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        selectedTags.includes(tag) 
                          ? "bg-[#0098FF] text-white border border-[#0098FF]" 
                          : "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Review */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Additional Feedback</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    className="w-full bg-black/50 border border-white/[0.05] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#0098FF] focus:ring-1 focus:ring-[#0098FF] transition-all min-h-[100px] resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full py-4 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

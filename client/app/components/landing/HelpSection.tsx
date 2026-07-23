"use client";

import React, { useState } from "react";
import {
  RiQuestionAnswerFill,
  RiArrowDownSLine,
  RiCustomerService2Fill,
} from "@remixicon/react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does PlusOnne ensure host and attendee safety?",
    answer:
      "Safety is our top priority. Every Host passes 3-layer verification: DigiLocker digital KYC, video call interviews, and on-site live face matching on the app. All active bookings include live GPS tracking and a 24/7 SOS button backed by on-ground response dispatches.",
    category: "Safety & Trust",
  },
  {
    question: "What is included in the base ₹1,000 service unit?",
    answer:
      "The base unit covers up to 1 hour of host time and 10 km of travel distance. Any additional minutes or kilometers are billed transparently with zero hidden markups.",
    category: "Pricing & Booking",
  },
  {
    question: "Can I book a companion for a full weekend or event?",
    answer:
      "Yes! You can choose our Bulk Pass (10 service credits) or the VIP Monthly Membership (₹10,000/mo), which includes 2 weekend experiences and 20% off any additional usage.",
    category: "Pricing & Booking",
  },
  {
    question: "How are hosts compensated?",
    answer:
      "Hosts receive a 70% revenue split on every service unit plus travel fees, alongside a guaranteed base stipend of ₹10,000/month for completing a minimum of 10 services. Top hosts can earn ₹25,000 to ₹30,000/month.",
    category: "Host Onboarding",
  },
  {
    question: "Are meetings strictly in public places?",
    answer:
      "Yes. To ensure complete comfort and safety for both hosts and attendees, all initial companion activities (coffee chats, city tours, gym sessions, gala events) take place in public, vetted locations.",
    category: "Safety & Trust",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "VIP subscribers enjoy free 100% cancellation up to 1 hour before the scheduled start time. Unit bookings can be rescheduled up to 2 hours prior with zero penalty.",
    category: "Pricing & Booking",
  },
];

export default function HelpSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = [
    "All",
    "Safety & Trust",
    "Pricing & Booking",
    "Host Onboarding",
  ];

  const filteredFaqs =
    selectedCat === "All"
      ? FAQS
      : FAQS.filter((faq) => faq.category === selectedCat);

  return (
    <section
      id="help"
      className="relative py-24 bg-[#090C16] overflow-hidden border-t border-white/[0.06]"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-l from-cyan-500/10 via-blue-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs sm:text-sm font-semibold text-cyan-400 mb-4 backdrop-blur-md">
            <RiQuestionAnswerFill className="w-4 h-4 text-cyan-400" />
            <span>Help, Safety & FAQs</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-outfit">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#0C4CD9] via-[#0098FF] to-[#1C7AFF] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Have questions about companion matching, safety protocols, pricing, or becoming a host? We're here to help.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCat(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCat === cat
                  ? "bg-white text-zinc-950 font-semibold shadow-md"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#101322]/90 border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-outfit font-semibold text-base sm:text-lg text-white hover:text-cyan-300 transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`p-2 rounded-full bg-white/5 border border-white/10 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-white/10 text-white" : "text-zinc-400"
                    }`}
                  >
                    <RiArrowDownSLine className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Need Help Box */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-blue-500/20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
            <RiCustomerService2Fill className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-outfit">
            Still have questions?
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Our 24/7 customer support and trust team is ready to assist you.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="mailto:support@plusone.com"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

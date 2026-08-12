"use client";

import { AlertTriangle, PhoneCall, XCircle } from "lucide-react";

interface SOSOverlayProps {
  onCancel: () => void;
  bookingId: string;
}

export default function SOSOverlay({ onCancel, bookingId }: SOSOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">SOS Alert Sent!</h2>
        <p className="text-slate-600 font-medium mb-8">
          Emergency response has been notified with your live location. Help is on the way.
        </p>

        <a 
          href="tel:112"
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 mb-4 transition-colors shadow-lg shadow-red-600/20"
        >
          <PhoneCall className="w-5 h-5" /> Call Emergency (112)
        </a>

        <button 
          onClick={onCancel}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <XCircle className="w-5 h-5" /> Cancel SOS (False Alarm)
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { HostAPI, HostProfile, BankDetails } from "@/app/lib/api/host.api";
import {
  User,
  Settings,
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/lib/context/AuthContext";
import { CategoriesAPI } from "@/app/lib/api/categories.api";



const AVAILABLE_LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"];

export default function HostProfilePage() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Form states
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [bankInfo, setBankInfo] = useState<BankDetails>({ accountNumber: "", ifsc: "", accountHolderName: "" });
  const [dbCategories, setDbCategories] = useState<{id: string, label: string}[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await HostAPI.getProfile();
      setProfile(data);
      setBio(data.bio || "");
      setCity(data.city || "");
      setSelectedCategories(data.categories || []);
      setSelectedLanguages(data.languages || []);
      if (data.bankDetails) {
        setBankInfo(data.bankDetails);
      }

      // Fetch Categories
      try {
        const cats = await CategoriesAPI.getAll();
        setDbCategories(cats.map(c => ({ id: c.categoryId, label: c.name })));
      } catch (err) {
        console.error("Failed to fetch DB categories", err);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await HostAPI.updateProfile({
        bio,
        city,
        categories: selectedCategories,
        languages: selectedLanguages,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBank = async () => {
    setSaving(true);
    try {
      await HostAPI.updateBankDetails(bankInfo);
      toast.success("Bank details updated successfully!");
    } catch (err) {
      toast.error("Failed to update bank details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Profile Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your public persona, services, and payout info.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info Section */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#0098FF]" /> Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Your Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about yourself..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#0098FF] min-h-[120px] transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#0098FF] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedLanguages.includes(lang) 
                        ? "bg-[#0098FF]/20 border-[#0098FF]/50 text-[#0098FF]" 
                        : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.08]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08] space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#0098FF]" /> Services & Categories
            </h3>
            <p className="text-sm text-zinc-400">Select the types of sessions you want to offer.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dbCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected 
                      ? "bg-[#0C4CD9]/10 border-[#0098FF]/40 shadow-[0_0_15px_rgba(0,152,255,0.1)]" 
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#0098FF] border-[#0098FF]' : 'border-zinc-600'}`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{cat.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0C4CD9] to-[#0098FF] hover:from-[#0C4CD9] hover:to-[#1C7AFF] text-white font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0098FF]/25 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bank Details & KYC */}
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#131824] to-[#0D111A] border border-white/[0.08]">
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Bank Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Account Holder Name</label>
                <input
                  type="text"
                  value={bankInfo.accountHolderName}
                  onChange={(e) => setBankInfo({...bankInfo, accountHolderName: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Account Number</label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">IFSC Code</label>
                <input
                  type="text"
                  value={bankInfo.ifsc}
                  onChange={(e) => setBankInfo({...bankInfo, ifsc: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors uppercase"
                />
              </div>

              <button
                onClick={handleSaveBank}
                disabled={saving}
                className="w-full mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                Update Bank Info
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0D111A] border border-white/[0.08]">
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" /> KYC Status
            </h3>
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Verification</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                {profile?.kycStatus || "Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

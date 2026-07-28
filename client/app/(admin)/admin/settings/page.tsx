"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../../lib/api/admin.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings2, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [hourPrice, setHourPrice] = useState<number>(0);
  const [kmPrice, setKmPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getUnitPrices();
      if (res?.data) {
        setHourPrice(res.data.hourPrice || 0);
        setKmPrice(res.data.kmPrice || 0);
      }
    } catch (err: any) {
      setMessage({ text: "Failed to load settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await AdminAPI.updateUnitPrices(hourPrice, kmPrice);
      setMessage({ text: "Global unit prices updated successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update prices.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-white text-black border border-white px-3 py-1 text-xs font-black uppercase tracking-widest">
            Platform Configuration
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Global Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Configure system-wide parameters such as base unit pricing for pay-per-use wallet balances.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
      ) : (
        <Card className="max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-zinc-500" />
              Pay-per-use Unit Pricing
            </CardTitle>
            <CardDescription>
              Set the price per hour and price per kilometer across the platform. This affects all users purchasing units.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="hourPrice" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Base Price per Hour (₹)
                </Label>
                <Input
                  id="hourPrice"
                  type="number"
                  value={hourPrice}
                  onChange={(e) => setHourPrice(Number(e.target.value))}
                  className="bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kmPrice" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Base Price per Kilometer (₹)
                </Label>
                <Input
                  id="kmPrice"
                  type="number"
                  value={kmPrice}
                  onChange={(e) => setKmPrice(Number(e.target.value))}
                  className="bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                {message.text}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

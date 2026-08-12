"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../../lib/api/admin.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database, Plus, Loader2, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    planId: "",
    name: "",
    type: "monthly",
    price: 0,
    hoursIncluded: 0,
    kmIncluded: 0,
    displayOrder: 1,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getPlans();
      if (res?.data) {
        setPlans(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    try {
      await AdminAPI.updatePlanStatus(planId, !currentStatus);
      setPlans(plans.map(p => p.planId === planId ? { ...p, isActive: !currentStatus } : p));
      toast.success(`Plan status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCreatePlan = async () => {
    try {
      await AdminAPI.createPlan(newPlan);
      setIsDialogOpen(false);
      toast.success("Plan created successfully!");
      fetchPlans();
    } catch (err: any) {
      toast.error("Failed to create plan: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-white text-black border border-white px-3 py-1 text-xs font-black uppercase tracking-widest">
            Monetization
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Manage the pricing tiers and subscription options available to users on the platform.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="z-10 bg-white text-black hover:bg-zinc-200 border-none font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="planId">Plan ID (slug)</Label>
                <Input id="planId" value={newPlan.planId} onChange={(e) => setNewPlan({...newPlan, planId: e.target.value})} placeholder="e.g. monthly_pro" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} placeholder="e.g. Monthly Pro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" value={newPlan.price} onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select 
                    className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
                    value={newPlan.type}
                    onChange={(e) => setNewPlan({...newPlan, type: e.target.value})}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hours">Included Hours</Label>
                  <Input id="hours" type="number" value={newPlan.hoursIncluded} onChange={(e) => setNewPlan({...newPlan, hoursIncluded: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="km">Included KMs</Label>
                  <Input id="km" type="number" value={newPlan.kmIncluded} onChange={(e) => setNewPlan({...newPlan, kmIncluded: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <Button onClick={handleCreatePlan} className="w-full">Create Plan</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
            <p className="text-xs font-bold text-zinc-500">Loading pricing plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Database className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No plans configured yet</p>
          </div>
        ) : (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/40">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
                <TableRow className="border-zinc-200 dark:border-zinc-800">
                  <TableHead className="font-black uppercase text-zinc-600 dark:text-zinc-400">Plan</TableHead>
                  <TableHead className="font-black uppercase text-zinc-600 dark:text-zinc-400">Price</TableHead>
                  <TableHead className="font-black uppercase text-zinc-600 dark:text-zinc-400">Benefits</TableHead>
                  <TableHead className="font-black uppercase text-zinc-600 dark:text-zinc-400">Status</TableHead>
                  <TableHead className="font-black uppercase text-zinc-600 dark:text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.planId} className="border-zinc-200 dark:border-zinc-800">
                    <TableCell>
                      <p className="font-bold text-zinc-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500 uppercase">{p.type} | ID: {p.planId}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-black">₹{p.price.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        <p>{p.hoursIncluded} Hours</p>
                        <p>{p.kmIncluded} KMs</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Label htmlFor={`switch-${p.planId}`} className="sr-only">Toggle Active</Label>
                        <Switch 
                          id={`switch-${p.planId}`}
                          checked={p.isActive}
                          onCheckedChange={() => handleToggleStatus(p.planId, p.isActive)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

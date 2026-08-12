"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../../lib/api/admin.api";
import { HostProfile } from "../../../lib/api/host.api";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  FileText,
  CreditCard,
  Building2,
  AlertCircle,
  Loader2,
  Filter,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminHostsManagementPage() {
  const [hosts, setHosts] = useState<(HostProfile & { email?: string; phone?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Selected Host for Review Dialog
  const [selectedHost, setSelectedHost] = useState<(HostProfile & { email?: string; phone?: string }) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getHosts();
      setHosts(data);
      // If no pending, switch default tab to all
      if (data.filter((h) => h.kycStatus === "pending").length === 0) {
        setActiveTab("all");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load host directory from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleReviewClick = (host: HostProfile & { email?: string; phone?: string }) => {
    setSelectedHost(host);
    setRejectionReason("");
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (status: "verified" | "rejected") => {
    if (!selectedHost) return;
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.warning("Please enter a brief rejection reason for the host.");
      return;
    }
    setActionLoading(true);
    try {
      await AdminAPI.updateHostKyc(selectedHost.hostId, status, rejectionReason);
      setHosts((prev) =>
        prev.map((h) =>
          h.hostId === selectedHost.hostId ? { ...h, kycStatus: status } : h
        )
      );
      setDialogOpen(false);
      setSelectedHost(null);
      toast.success(`Host status updated to ${status}`);
    } catch (err: any) {
      toast.error(`Failed to update KYC status: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHosts = hosts.filter((h) => {
    const matchesTab =
      activeTab === "all" ? true : h.kycStatus === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (h.displayName || "").toLowerCase().includes(q) ||
      (h.city || "").toLowerCase().includes(q) ||
      (h.email || "").toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const pendingCount = hosts.filter((h) => h.kycStatus === "pending").length;
  const verifiedCount = hosts.filter((h) => h.kycStatus === "verified").length;
  const rejectedCount = hosts.filter((h) => h.kycStatus === "rejected").length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-white text-black border border-white px-3 py-1 text-xs font-black uppercase tracking-widest">
            Identity Verification Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Host Network & KYC Review
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Inspect government identification cards (Aadhaar/PAN), verify host credentials, and approve companion listings for public booking.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="p-4 rounded-md bg-zinc-800 dark:bg-zinc-900 border border-zinc-700 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white text-black flex items-center justify-center font-black text-base">
              {pendingCount}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white">Pending Review</p>
              <p className="text-[11px] text-zinc-400">Requires action</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table & Filter Section */}
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 h-auto flex flex-wrap">
              <TabsTrigger value="pending" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Pending KYC ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Verified Hosts ({verifiedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                All Records ({hosts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, email..."
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white rounded-md pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white h-10 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Loading host records from DynamoDB...</p>
          </div>
        ) : filteredHosts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <ShieldCheck className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No hosts found matching your criteria</p>
            <p className="text-xs text-zinc-500">Try adjusting your filter tabs or search keywords.</p>
          </div>
        ) : (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/40">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
                <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Host Companion</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">City & Experience</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Categories</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Trust Score</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">KYC Status</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHosts.map((host) => (
                  <TableRow key={host.hostId} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 transition-colors">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
                          <AvatarImage src={host.avatarUrl || ""} alt={host.displayName || "Host"} />
                          <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-black text-xs">
                            {host.displayName ? host.displayName.substring(0, 2).toUpperCase() : "HO"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{host.displayName || "Companion Host"}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[320px]">{host.email || host.phone || "Verified Contact"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-sm font-bold text-zinc-800 dark:text-slate-200">{host.city || "Mumbai"}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{host.experienceYears || 1} years exp.</p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[400px]">
                        {(host.categories || ["coffee_date"]).slice(0, 2).map((cat, i) => (
                          <Badge key={i} className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold">
                            {cat.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge className="bg-zinc-900 dark:bg-zinc-900 text-white border border-zinc-800 font-black text-xs px-2.5 py-1">
                        {host.hostTrustScore || 90}/100
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {host.kycStatus === "verified" && (
                        <Badge className="bg-zinc-900 text-white border border-zinc-800 px-2.5 py-1 font-extrabold text-[11px] flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Verified</span>
                        </Badge>
                      )}
                      {host.kycStatus === "pending" && (
                        <Badge className="bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white px-2.5 py-1 font-extrabold text-[11px] flex items-center gap-1.5 w-fit animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-white dark:text-black" />
                          <span>Pending Review</span>
                        </Badge>
                      )}
                      {host.kycStatus === "rejected" && (
                        <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 font-extrabold text-[11px] flex items-center gap-1.5 w-fit">
                          <XCircle className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                          <span>Rejected</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleReviewClick(host)}
                        className={`rounded-md px-4 py-2 text-xs font-bold shadow-md transition-all ${
                          host.kycStatus === "pending"
                            ? "bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-black"
                            : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        <span>{host.kycStatus === "pending" ? "Review KYC" : "Inspect"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* KYC Document Review & Decision Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-[1150px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {selectedHost && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-zinc-900 text-white border border-zinc-800 px-3 py-1 text-xs font-black uppercase tracking-wider">
                    Host Application #{selectedHost.hostId}
                  </Badge>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Applied: {selectedHost.createdAt ? new Date(selectedHost.createdAt).toLocaleDateString() : "Recently"}</span>
                </div>
                <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white mt-2 flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-zinc-300 dark:border-zinc-700">
                    <AvatarImage src={selectedHost.avatarUrl || ""} alt={selectedHost.displayName || "Host"} />
                    <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-black">
                      {selectedHost.displayName ? selectedHost.displayName.substring(0, 2).toUpperCase() : "HO"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedHost.displayName || "Companion Host"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">{selectedHost.city} • {selectedHost.experienceYears || 1} Years Experience</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-300 pt-2 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md border border-zinc-200 dark:border-zinc-800">
                  <strong>Host Bio:</strong> "{selectedHost.bio || "No bio provided yet."}"
                </DialogDescription>
              </DialogHeader>

              {/* Bank Details Section */}
              <div className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payout Bank Account Details</span>
                </h4>
                {selectedHost.bankDetails ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-zinc-500 block">Holder Name</span>
                      <strong className="text-zinc-900 dark:text-white font-mono">{selectedHost.bankDetails.accountHolderName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Account Number</span>
                      <strong className="text-zinc-900 dark:text-white font-mono">{selectedHost.bankDetails.accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">IFSC Code</span>
                      <strong className="text-zinc-900 dark:text-white font-mono">{selectedHost.bankDetails.ifsc}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No bank account linked yet (skipped during onboarding).</p>
                )}
              </div>

              {/* KYC Document Gallery Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Submitted KYC Verification Documents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">1. Aadhaar Card (Front/Back)</p>
                      <span className="text-[10px] text-zinc-400">Click to enlarge</span>
                    </div>
                    <div
                      onClick={() => window.open(selectedHost.kycDocuments?.aadhaarUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80", "_blank")}
                      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 aspect-video relative group cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={selectedHost.kycDocuments?.aadhaarUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80"}
                        alt="Aadhaar"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>View Full ID</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">2. PAN Card Document</p>
                      <span className="text-[10px] text-zinc-400">Click to enlarge</span>
                    </div>
                    <div
                      onClick={() => window.open(selectedHost.kycDocuments?.panUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80", "_blank")}
                      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 aspect-video relative group cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={selectedHost.kycDocuments?.panUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                        alt="PAN"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>View Full ID</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">3. Live Selfie Verification</p>
                      <span className="text-[10px] text-zinc-400">Click to enlarge</span>
                    </div>
                    <div
                      onClick={() => window.open(selectedHost.kycDocuments?.photoUrl || selectedHost.avatarUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", "_blank")}
                      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 aspect-video relative group cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={selectedHost.kycDocuments?.photoUrl || selectedHost.avatarUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"}
                        alt="Selfie"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>View Full Photo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Note Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Rejection Reason (Required ONLY if Rejecting)
                </label>
                <Input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Aadhaar card photo is blurry. Please re-upload a high-resolution scan."
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white rounded-md px-4 py-3 text-xs text-zinc-900 dark:text-white h-11"
                />
              </div>

              {/* Action Buttons Footer */}
              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={actionLoading}
                  className="rounded-md border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold h-12 px-6 text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={actionLoading}
                  className="rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold h-12 px-6 text-xs flex items-center gap-2 border border-zinc-700 transition-all"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  <span>Reject Application</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleStatusUpdate("verified")}
                  disabled={actionLoading}
                  className="rounded-md bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-black h-12 px-6 text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>Approve & Verify Host</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

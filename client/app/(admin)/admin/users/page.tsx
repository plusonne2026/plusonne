"use client";

import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../../lib/api/admin.api";
import { User } from "../../../lib/api/auth.api";
import {
  Users,
  Search,
  UserCheck,
  UserMinus,
  ShieldCheck,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  ArrowUpDown,
  Sparkles,
  Wallet,
  CreditCard,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletUser, setWalletUser] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [creditHours, setCreditHours] = useState(0);
  const [creditKm, setCreditKm] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user directory from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended") => {
    setActionLoadingId(userId);
    try {
      await AdminAPI.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, status: newStatus } : u))
      );
      toast.success(`User status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "host" | "admin") => {
    setActionLoadingId(userId);
    try {
      await AdminAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(`Failed to update role: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenWallet = async (user: User) => {
    setWalletUser(user);
    setIsWalletModalOpen(true);
    setWalletLoading(true);
    try {
      const res = await AdminAPI.getUserBalance(user.userId);
      setWalletBalance(res.data);
    } catch (err) {
      setWalletBalance(null);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCreditUnits = async () => {
    if (!walletUser) return;
    try {
      setWalletLoading(true);
      await AdminAPI.creditUserUnits(walletUser.userId, creditHours, creditKm);
      const res = await AdminAPI.getUserBalance(walletUser.userId);
      setWalletBalance(res.data);
      setCreditHours(0);
      setCreditKm(0);
      toast.success("Units credited successfully!");
    } catch (err: any) {
      toast.error("Failed to credit units: " + err.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.city || "").toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-white text-black border border-white px-3 py-1 text-xs font-black uppercase tracking-widest">
            Platform User Base
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Manage registered accounts, adjust role privileges (User/Host/Admin), and enforce safety guidelines across the PlusOnne community.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Filter & Table Section */}
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full md:w-auto">
            <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 h-auto flex flex-wrap">
              <TabsTrigger value="all" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                All Roles ({users.length})
              </TabsTrigger>
              <TabsTrigger value="user" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Users ({users.filter((u) => u.role === "user").length})
              </TabsTrigger>
              <TabsTrigger value="host" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Hosts ({users.filter((u) => u.role === "host").length})
              </TabsTrigger>
              <TabsTrigger value="admin" className="rounded-md px-4 py-2 text-xs font-extrabold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                Admins ({users.filter((u) => u.role === "admin").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white rounded-md pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white h-10 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Loading directory from DynamoDB Users Table...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Users className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No users match your active filter</p>
          </div>
        ) : (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/40">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
                <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">User Profile</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Location & Joined</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Role Permission</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Bookings & Volume</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4">Status</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 py-4 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.userId} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 transition-colors">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
                          <AvatarImage src={u.avatarUrl || ""} alt={u.displayName} />
                          <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-black text-xs">
                            {u.displayName ? u.displayName.substring(0, 2).toUpperCase() : "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{u.displayName || "User Account"}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[360px]">{u.email || u.phone || "No Email"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-sm font-bold text-zinc-800 dark:text-slate-200">{u.city || "Mumbai"}</p>
                      <p className="text-xs text-zinc-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Member"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {u.role === "admin" && (
                        <Badge className="bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white font-black text-xs px-2.5 py-1">
                          Master Admin
                        </Badge>
                      )}
                      {u.role === "host" && (
                        <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-extrabold text-xs px-2.5 py-1">
                          Host Profile
                        </Badge>
                      )}
                      {(u.role === "user" || !u.role) && (
                        <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-extrabold text-xs px-2.5 py-1">
                          Regular User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-sm font-black text-zinc-900 dark:text-white">{formatCurrency(Number(u.totalSpent || 0))}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{u.totalBookings || 0} Bookings</p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {u.status === "suspended" ? (
                        <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-extrabold text-[11px] px-2.5 py-1">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-900 text-white border border-zinc-800 font-extrabold text-[11px] px-2.5 py-1 flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Active</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === u.userId}
                            className="rounded-md border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white px-2.5"
                          >
                            {actionLoadingId === u.userId ? (
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-900 dark:text-white" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 rounded-md p-2 shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Change Role Privilege
                          </DropdownMenuLabel>
                          {u.role !== "host" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "host")}
                              className="rounded-md px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-800 dark:text-zinc-200"
                            >
                              Promote to Host
                            </DropdownMenuItem>
                          )}
                          {u.role !== "user" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "user")}
                              className="rounded-md px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-800 dark:text-zinc-200"
                            >
                              Set as Regular User
                            </DropdownMenuItem>
                          )}
                          {u.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "admin")}
                              className="rounded-md px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                              Promote to Master Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                          <DropdownMenuLabel className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Account Moderation
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenWallet(u)}
                            className="rounded-md px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                          >
                            <Wallet className="w-3.5 h-3.5 mr-2" />
                            Manage Wallet Units
                          </DropdownMenuItem>
                          {u.status === "suspended" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.userId, "active")}
                              className="rounded-md px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                              Activate Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.userId, "suspended")}
                              className="rounded-md px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Wallet Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Wallet & Units</DialogTitle>
          </DialogHeader>
          {walletLoading && !walletBalance ? (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-md grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Hours Balance</p>
                  <p className="text-2xl font-black text-blue-600">{walletBalance?.hoursBalance || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">KM Balance</p>
                  <p className="text-2xl font-black text-emerald-600">{walletBalance?.kmBalance || 0}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Credit Hours Manually</Label>
                <Input type="number" value={creditHours} onChange={(e) => setCreditHours(Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label>Credit KMs Manually</Label>
                <Input type="number" value={creditKm} onChange={(e) => setCreditKm(Number(e.target.value))} />
              </div>
              
              <Button 
                onClick={handleCreditUnits} 
                disabled={walletLoading || (creditHours === 0 && creditKm === 0)}
                className="w-full mt-2"
              >
                {walletLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Credit Units to Wallet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

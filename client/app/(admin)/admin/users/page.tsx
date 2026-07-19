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
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
    } catch (err: any) {
      alert(`Failed to update status: ${err.message || "Unknown error"}`);
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
    } catch (err: any) {
      alert(`Failed to update role: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131824] via-[#161D2D] to-[#131824] p-6 sm:p-8 rounded-[32px] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <Badge className="bg-[#0098FF]/20 text-[#0098FF] border border-[#0098FF]/40 px-3 py-1 text-xs font-black uppercase tracking-widest">
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
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Filter & Table Section */}
      <Card className="bg-[#0D111A]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full md:w-auto">
            <TabsList className="bg-[#131824] p-1.5 rounded-2xl border border-white/[0.08] h-auto flex flex-wrap">
              <TabsTrigger value="all" className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-[#0098FF] data-[state=active]:text-white">
                All Roles ({users.length})
              </TabsTrigger>
              <TabsTrigger value="user" className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-[#0098FF] data-[state=active]:text-white">
                Users ({users.filter((u) => u.role === "user").length})
              </TabsTrigger>
              <TabsTrigger value="host" className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Hosts ({users.filter((u) => u.role === "host").length})
              </TabsTrigger>
              <TabsTrigger value="admin" className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                Admins ({users.filter((u) => u.role === "admin").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="bg-[#131824] border-white/[0.08] focus:border-[#0098FF] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white h-10 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0098FF]" />
            <p className="text-xs font-bold text-zinc-400">Loading directory from DynamoDB Users Table...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto text-zinc-500">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">No users match your active filter</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#131824]/40">
            <Table>
              <TableHeader className="bg-[#131824]">
                <TableRow className="border-white/[0.08] hover:bg-transparent">
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4">User Profile</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4">Location & Joined</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4">Role Permission</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4">Bookings & Volume</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4">Status</TableHead>
                  <TableHead className="text-xs font-black uppercase text-zinc-400 py-4 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.userId} className="border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-[#0098FF]/40 shrink-0">
                          <AvatarImage src={u.avatarUrl || ""} alt={u.displayName} />
                          <AvatarFallback className="bg-[#0C4CD9] text-white font-black text-xs">
                            {u.displayName ? u.displayName.substring(0, 2).toUpperCase() : "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-white">{u.displayName || "User Account"}</p>
                          <p className="text-xs text-zinc-400 truncate max-w-[180px]">{u.email || u.phone || "No Email"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-sm font-bold text-slate-200">{u.city || "Mumbai"}</p>
                      <p className="text-xs text-zinc-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Member"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {u.role === "admin" && (
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-xs px-2.5 py-1">
                          Master Admin
                        </Badge>
                      )}
                      {u.role === "host" && (
                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 font-extrabold text-xs px-2.5 py-1">
                          Host Profile
                        </Badge>
                      )}
                      {(u.role === "user" || !u.role) && (
                        <Badge className="bg-[#0098FF]/15 text-[#0098FF] border border-[#0098FF]/30 font-extrabold text-xs px-2.5 py-1">
                          Regular User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-sm font-black text-emerald-400">{formatCurrency(Number(u.totalSpent || 0))}</p>
                      <p className="text-xs text-zinc-400">{u.totalBookings || 0} Bookings</p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {u.status === "suspended" ? (
                        <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold text-[11px] px-2.5 py-1">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] px-2.5 py-1 flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
                            className="rounded-xl border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-white px-2.5"
                          >
                            {actionLoadingId === u.userId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-[#131824] border-white/[0.12] text-slate-100 rounded-2xl p-2 shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                            Change Role Privilege
                          </DropdownMenuLabel>
                          {u.role !== "host" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "host")}
                              className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
                            >
                              Promote to Host
                            </DropdownMenuItem>
                          )}
                          {u.role !== "user" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "user")}
                              className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-white/[0.08] cursor-pointer"
                            >
                              Set as Regular User
                            </DropdownMenuItem>
                          )}
                          {u.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.userId, "admin")}
                              className="rounded-xl px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                            >
                              Promote to Master Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/[0.08]" />
                          <DropdownMenuLabel className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                            Account Moderation
                          </DropdownMenuLabel>
                          {u.status === "suspended" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.userId, "active")}
                              className="rounded-xl px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                            >
                              Activate Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.userId, "suspended")}
                              className="rounded-xl px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
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
    </div>
  );
}

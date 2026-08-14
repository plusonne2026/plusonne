import { apiClient } from "./client";
import { User } from "./auth.api";
import { HostProfile } from "./host.api";

export interface CategoryStat {
  category: string;
  count: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: "kyc_pending" | "host_verified" | "user_registered" | "booking";
  message: string;
  timestamp: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalHosts: number;
  verifiedHosts: number;
  pendingKycHosts: number;
  rejectedHosts: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: number;
  categoryStats: CategoryStat[];
  recentActivities: RecentActivity[];
}

export interface AdminLoginResponse {
  success: boolean;
  data: User;
  token: string;
}

export const AdminAPI = {
  /**
   * Direct backend login for admin credentials
   * POST /api/v1/auth/admin-login
   */
  adminLogin: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    const res = await apiClient.post<AdminLoginResponse>("/auth/admin-login", { email, password: pass });
    return {
      user: res.data,
      token: res.token,
    };
  },

  /**
   * Get comprehensive platform dashboard statistics
   * GET /api/v1/admin/stats
   */
  getStats: async (): Promise<PlatformStats> => {
    const res = await apiClient.get<{ success: boolean; data: PlatformStats }>("/admin/stats");
    return res.data;
  },

  /**
   * Get all registered users
   * GET /api/v1/admin/users
   */
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>("/admin/users");
    return res.data;
  },

  /**
   * Get all host profiles joined with user info
   * GET /api/v1/admin/hosts
   */
  getHosts: async (): Promise<(HostProfile & { email?: string; phone?: string })[]> => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>("/admin/hosts");
    return res.data;
  },

  /**
   * Update user status (active / suspended / deleted)
   * PUT /api/v1/admin/users/:userId/status
   */
  updateUserStatus: async (userId: string, status: "active" | "suspended" | "deleted"): Promise<any> => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  /**
   * Update user role (user / host / admin)
   * PUT /api/v1/admin/users/:userId/role
   */
  updateUserRole: async (userId: string, role: "user" | "host" | "admin"): Promise<any> => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  /**
   * Approve or reject host KYC verification
   * PUT /api/v1/admin/hosts/:hostId/kyc-status
   */
  updateHostKyc: async (hostId: string, kycStatus: "verified" | "rejected" | "pending", rejectionReason?: string): Promise<any> => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/admin/hosts/${hostId}/kyc-status`, {
      kycStatus,
      rejectionReason,
    });
    return res.data;
  },

  // ================= PLANS ================= //

  getPlans: async (includeInactive = true): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any[] }>(`/admin/plans?includeInactive=${includeInactive}`);
  },

  createPlan: async (planData: any): Promise<any> => {
    return apiClient.post<{ success: boolean; data: any }>("/admin/plans", planData);
  },

  updatePlanStatus: async (planId: string, isActive: boolean): Promise<any> => {
    return apiClient.put<{ success: boolean; data: any }>(`/admin/plans/${planId}/status`, { isActive });
  },

  // ================= UNITS & SETTINGS ================= //

  getUnitPrices: async (): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any }>("/admin/settings/units");
  },

  updateUnitPrices: async (hourPrice: number, kmPrice: number): Promise<any> => {
    return apiClient.put<{ success: boolean; data: any }>("/admin/settings/units", { hourPrice, kmPrice });
  },

  getUserBalance: async (userId: string): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any }>(`/admin/users/${userId}/balance`);
  },

  creditUserUnits: async (userId: string, hoursAmount: number, kmAmount: number): Promise<any> => {
    return apiClient.post<{ success: boolean; data: any }>(`/admin/users/${userId}/credit-units`, { hoursAmount, kmAmount });
  },

  // ================= SOS ================= //
  getActiveSOSAlerts: async (): Promise<any[]> => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>("/sos/active");
    return res.data;
  },

  updateSOSStatus: async (alertId: string, payload: any): Promise<any> => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/sos/${alertId}/status`, payload);
    return res.data;
  },

  // ================= GPS ================= //
  getActiveSessions: async (): Promise<any[]> => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>("/admin/sessions/active");
    return res.data;
  },

  // ================= FINANCE ================= //
  getPendingPayouts: async (): Promise<any[]> => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>("/admin/finance/payouts");
    return res.data;
  },

  processPayout: async (bookingId: string): Promise<any> => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/admin/finance/payouts/${bookingId}/process`, {});
    return res.data;
  },
};

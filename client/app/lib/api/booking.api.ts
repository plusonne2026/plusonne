import { apiClient } from "./client";

export interface BookingRequest {
  id?: string;
  bookingId: string;
  hostId?: string;
  userId?: string;
  clientName: string;
  clientAvatar: string;
  hostName?: string;
  hostAvatar?: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  payout: number;
  location: string;
  userLat?: number;
  userLng?: number;
  hostLat?: number;
  hostLng?: number;
  status: "pending" | "pending_match" | "host_assigned" | "host_confirmed" | "active" | "completed" | "cancelled" | "rejected";
  notes?: string;
  createdAt?: string;
}

export interface RatingPayload {
  bookingId: string;
  userId?: string;
  hostId?: string;
  behavior: number;
  respect: number;
  safety: number;
  cooperation: number;
  reviewText?: string;
}

export const BookingAPI = {
  /**
   * Get all booking requests for current host
   * GET /api/v1/bookings/requests
   */
  getRequests: async (): Promise<BookingRequest[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/bookings/requests");
      return (res.data || []).map(b => ({
        ...b,
        id: b.bookingId,
        clientName: b.clientName || (b.userId ? `User ${b.userId.substring(0, 4)}` : "Verified User"),
        clientAvatar: b.clientAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        category: b.categoryId || "Companionship",
        date: b.scheduledDate || "TBD",
        time: b.scheduledTime || "TBD",
        duration: b.durationHours ? `${b.durationHours} Hours` : "As per package",
        payout: b.price?.total || b.price?.base || 0,
        location: b.pickupLocation?.address || "Location pending",
      }));
    } catch (err) {
      console.warn("API error fetching bookings, returning empty fallback list", err);
      return [];
    }
  },

  /**
   * Get current user's or host's bookings
   * GET /api/v1/bookings/my
   */
  getMyBookings: async (asRole?: 'user' | 'host'): Promise<BookingRequest[]> => {
    try {
      const url = asRole ? `/bookings/my?as=${asRole}` : "/bookings/my";
      const res = await apiClient.get<{ success: boolean; data: any[] }>(url);
      return (res.data || []).map(b => ({
        ...b,
        id: b.bookingId,
        clientName: b.clientName || (b.userId ? `User ${b.userId.substring(0, 4)}` : "Verified User"),
        clientAvatar: b.clientAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        hostName: b.hostName || undefined,
        hostAvatar: b.hostAvatar || undefined,
        category: b.categoryId || "Companionship",
        date: b.scheduledDate || "TBD",
        time: b.scheduledTime || "TBD",
        duration: b.durationHours ? `${b.durationHours} Hours` : "As per package",
        payout: b.price?.total || b.price?.base || 0,
        location: b.pickupLocation?.address || "Location pending",
      }));
    } catch (err) {
      console.warn("API error fetching my bookings, returning empty fallback list", err);
      return [];
    }
  },

  /**
   * Get booking details by ID
   * GET /api/v1/bookings/:bookingId
   */
  getById: async (bookingId: string): Promise<BookingRequest | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: BookingRequest }>(`/bookings/${bookingId}`);
      return res.data;
    } catch (err) {
      console.warn("API error fetching booking by ID", err);
      return null;
    }
  },

  /**
   * Update booking status (accepted, declined, in_session, completed)
   * PUT /api/v1/bookings/:bookingId/status
   */
  updateStatus: async (bookingId: string, status: BookingRequest["status"], reason?: string): Promise<BookingRequest> => {
    const res = await apiClient.put<{ success: boolean; data: BookingRequest }>(`/bookings/${bookingId}/status`, {
      status,
      reason,
    });
    return res.data;
  },

  /**
   * Submit post-session host evaluation of user
   * POST /api/v1/ratings
   */
  submitRating: async (payload: RatingPayload): Promise<any> => {
    try {
      const backendPayload = {
        bookingId: payload.bookingId,
        targetUserId: payload.userId || payload.hostId,
        rating: Math.round((payload.behavior + payload.respect + payload.safety + payload.cooperation) / 4),
        review: payload.reviewText || "",
        tags: [
          `behavior:${payload.behavior}`,
          `respect:${payload.respect}`,
          `safety:${payload.safety}`,
          `cooperation:${payload.cooperation}`
        ]
      };
      const res = await apiClient.post<{ success: boolean; data: any }>("/ratings", backendPayload);
      return res.data;
    } catch (err) {
      console.error("Backend rating submission failed:", err);
      throw err;
    }
  },
};

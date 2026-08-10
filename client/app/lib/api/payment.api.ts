import { apiClient } from "./client";

export const PaymentAPI = {
  createOrder: async (bookingId: string) => {
    const response = await apiClient.post("/payments/create-order", { bookingId }) as any;
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to create order");
  },

  verifyPayment: async (data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, bookingId: string }) => {
    const response = await apiClient.post("/payments/verify", data) as any;
    if (response.success) return response.data;
    throw new Error(response.message || "Payment verification failed");
  },
};

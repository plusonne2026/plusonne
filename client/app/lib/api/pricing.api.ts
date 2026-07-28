import { apiClient } from "./client";

export const PricingAPI = {
  /**
   * Get active subscription plans
   */
  getActivePlans: async (): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any[] }>("/plans");
  },

  /**
   * Get global unit prices
   */
  getUnitPrices: async (): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any }>("/units/prices");
  },

  /**
   * Get authenticated user's wallet balance
   */
  getMyBalance: async (): Promise<any> => {
    return apiClient.get<{ success: boolean; data: any }>("/units/balance");
  },

  /**
   * Simulate a purchase of units
   */
  purchaseUnits: async (hoursAmount: number, kmAmount: number, amountPaid: number): Promise<any> => {
    return apiClient.post<{ success: boolean; data: any }>("/units/purchase", {
      hoursAmount,
      kmAmount,
      amountPaid,
    });
  },
};

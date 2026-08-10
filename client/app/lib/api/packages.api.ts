import { apiClient } from "./client";

export interface Package {
  packageId: string;
  categoryId: string;
  name: string;
  description: string;
  durationHours: number;
  distanceKm: number;
  basePrice: number;
  images: string[];
  inclusions: string[];
  extraCharges: {
    perExtraHour: number;
    perExtraKm: number;
  };
  cancellationPolicy: {
    freeCancelHoursBefore: number;
    cancellationFee: number;
  };
  city: string;
  isActive: boolean;
  popularity: number;
}

export const PackagesAPI = {
  getAll: async (includeInactive = false, city?: string, categoryId?: string): Promise<Package[]> => {
    let url = `/packages?includeInactive=${includeInactive}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    if (categoryId) url += `&categoryId=${encodeURIComponent(categoryId)}`;
    
    const response = await apiClient.get(url);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to fetch packages");
  },

  getById: async (id: string): Promise<Package> => {
    const response = await apiClient.get(`/packages/${id}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to fetch package");
  },

  create: async (data: Partial<Package>): Promise<Package> => {
    const response = await apiClient.post("/packages", data);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to create package");
  },

  update: async (id: string, data: Partial<Package>): Promise<Package> => {
    const response = await apiClient.put(`/packages/${id}`, data);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to update package");
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/packages/${id}`);
    return response.success;
  }
};

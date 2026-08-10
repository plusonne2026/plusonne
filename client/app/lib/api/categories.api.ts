import { apiClient } from "./client";

export interface Category {
  categoryId: string;
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export const CategoriesAPI = {
  getAll: async (includeInactive = false): Promise<Category[]> => {
    const response = await apiClient.get(`/categories?includeInactive=${includeInactive}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to fetch categories");
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to fetch category");
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to create category");
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    if (response.success) return response.data;
    throw new Error(response.message || "Failed to update category");
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.success;
  }
};

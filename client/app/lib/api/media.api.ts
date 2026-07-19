import { API_BASE_URL } from "./client";

export interface MediaUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  resourceType?: string;
  note?: string;
}

export const MediaAPI = {
  /**
   * Upload a single file (image, photo, PDF, video) to backend/Cloudinary
   */
  uploadFile: async (file: File, folder = "plusone_uploads"): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const token = typeof window !== "undefined" ? localStorage.getItem("plusone_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to upload file");
    }

    return data.data;
  },
};

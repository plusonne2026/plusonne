/**
 * Base HTTP Client for PlusOne API
 * Communicates with backend Express server (default: http://localhost:5000/api/v1)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export class APIError extends Error {
  public status?: number;
  public details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  token?: string | null;
  userId?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Get token and userId from localStorage if available
  let token = options.token;
  let userId = options.userId;

  if (typeof window !== "undefined") {
    if (token === undefined) {
      token = localStorage.getItem("plusone_auth_token");
    }
    if (userId === undefined) {
      userId = localStorage.getItem("plusone_user_id");
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new APIError(errorMessage, response.status, data);
    }

    // Backend standardized response format check: { success: true/false, data: ... }
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) {
        const errorMessage = data.error || data.message || "API returned unsuccessful response";
        throw new APIError(errorMessage, response.status, data);
      }
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error?.message || "Network request failed", 500, error);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

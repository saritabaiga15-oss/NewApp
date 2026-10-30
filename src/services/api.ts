/**
 * Backend API Client for Honour Your Mentor (onodemBackend)
 * Connects the Expo / React Native frontend to Spring Boot + Supabase backend.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// In production, connects directly to onodem.com; in local dev, connects to localhost / emulator
const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;
const DEFAULT_HOST = isDev
  ? Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://localhost:8080"
  : "https://api.onodem.com";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api/v1`;

const TOKEN_KEY = "@honour-your-mentor/token";
const REFRESH_TOKEN_KEY = "@honour-your-mentor/refresh_token";

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token: string, refreshToken?: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data: T }> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json;
}

export const api = {
  // Authentication
  auth: {
    register: (data: { name: string; email: string; password: string; username?: string }) =>
      apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { emailOrUsername: string; password: string }) =>
      apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => apiRequest("/auth/me"),
    forgotPassword: (email: string) =>
      apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    verifyOtp: (email: string, code: string) =>
      apiRequest("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) }),
    resetPassword: (email: string, code: string, newPassword: string) =>
      apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      }),
  },

  // Mentors
  mentors: {
    list: () => apiRequest("/mentors"),
    getById: (id: string) => apiRequest(`/mentors/${id}`),
    create: (data: any) =>
      apiRequest("/mentors", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      apiRequest(`/mentors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/mentors/${id}`, { method: "DELETE" }),
  },

  // Tributes & Memories
  tributes: {
    myTributes: () => apiRequest("/tributes/my-tributes"),
    publicFeed: (page = 0, size = 20) =>
      apiRequest(`/tributes/public-feed?page=${page}&size=${size}`),
    getById: (id: string) => apiRequest(`/tributes/${id}`),
    create: (data: any) =>
      apiRequest("/tributes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      apiRequest(`/tributes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/tributes/${id}`, { method: "DELETE" }),
    togglePin: (id: string) => apiRequest(`/tributes/${id}/pin`, { method: "POST" }),
    byMentor: (mentorId: string) => apiRequest(`/tributes/mentor/${mentorId}`),
  },

  // Public Feed with filters
  feed: {
    get: (params: { category?: string; relationship?: string; kind?: string; search?: string; page?: number; size?: number } = {}) => {
      const q = new URLSearchParams();
      if (params.category) q.append("category", params.category);
      if (params.relationship) q.append("relationship", params.relationship);
      if (params.kind) q.append("kind", params.kind);
      if (params.search) q.append("search", params.search);
      if (params.page !== undefined) q.append("page", String(params.page));
      if (params.size !== undefined) q.append("size", String(params.size));
      return apiRequest(`/feed?${q.toString()}`);
    },
  },

  // Engagement
  engagement: {
    toggleLike: (tributeId: string) =>
      apiRequest(`/tributes/${tributeId}/like`, { method: "POST" }),
    likeStatus: (tributeId: string) => apiRequest(`/tributes/${tributeId}/like-status`),
    addComment: (tributeId: string, content: string) =>
      apiRequest(`/tributes/${tributeId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    getComments: (tributeId: string) => apiRequest(`/tributes/${tributeId}/comments`),
    deleteComment: (commentId: string) =>
      apiRequest(`/comments/${commentId}`, { method: "DELETE" }),
  },

  // Reminders
  reminders: {
    list: () => apiRequest("/reminders"),
    create: (data: any) =>
      apiRequest("/reminders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      apiRequest(`/reminders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/reminders/${id}`, { method: "DELETE" }),
  },

  // Media & File Uploads (Pictures, Audio notes, Scanned Letters)
  media: {
    upload: async (fileUri: string, filename?: string, mimeType?: string, category = "general") => {
      const token = await getAuthToken();
      const formData = new FormData();

      if (Platform.OS === "web") {
        try {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          formData.append("file", blob, filename || "upload.jpg");
        } catch {
          formData.append("file", fileUri as any);
        }
      } else {
        formData.append("file", {
          uri: fileUri,
          name: filename || "upload.jpg",
          type: mimeType || "image/jpeg",
        } as any);
      }
      formData.append("category", category);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/media/upload`, {
        method: "POST",
        body: formData,
        headers,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Upload failed with status ${res.status}`);
      }
      return json;
    },
    poolHealth: () => apiRequest("/media/pool-health"),
  },
};

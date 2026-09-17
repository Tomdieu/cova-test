import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { User, LoginResponse, CreateTaskPayload, Task } from "@/types";

const API_BASE = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8000/api";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(REFRESH_KEY);
  }
  return SecureStore.getItemAsync(REFRESH_KEY);
}

async function setTokens(access: string, refresh: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

async function clearTokens() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await setTokens(data.access, data.refresh ?? refresh);
    return data.access;
  } catch {
    return null;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...rest,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData.detail ||
      errorData.non_field_errors?.[0] ||
      Object.values(errorData).flat().join(", ") ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const auth = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => request<User>("/auth/register/", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login/", { method: "POST", body: data }),

  profile: () => request<User>("/auth/profile/"),
};

export const tasks = {
  list: () => request<Task[]>("/tasks/"),

  create: (data: CreateTaskPayload) =>
    request<Task>("/tasks/", { method: "POST", body: data }),

  update: (id: number, data: CreateTaskPayload) =>
    request<Task>(`/tasks/${id}/`, { method: "PUT", body: data }),

  delete: (id: number) =>
    request<void>(`/tasks/${id}/`, { method: "DELETE" }),
};

export { setTokens, clearTokens, getToken };

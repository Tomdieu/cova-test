const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.access, data.refresh ?? refresh);
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
  const token = getToken();

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

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  user: User;
  refresh: string;
  access: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  created_at: string;
  updated_at: string;
}

export type TaskStatus = Task["status"];

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskPayload extends CreateTaskPayload {}

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

  update: (id: number, data: UpdateTaskPayload) =>
    request<Task>(`/tasks/${id}/`, { method: "PUT", body: data }),

  delete: (id: number) =>
    request<void>(`/tasks/${id}/`, { method: "DELETE" }),
};

export { setTokens, clearTokens, getToken };

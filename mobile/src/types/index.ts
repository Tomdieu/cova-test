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
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

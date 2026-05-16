// ---- Request Types ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

// ---- Response Types ----
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  active: boolean;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserInfo;
}

import type { BaseResponse } from "../../types/common";

export type { BaseResponse };

// ---- Auth State ----
export interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

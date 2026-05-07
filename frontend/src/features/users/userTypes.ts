import type { UserInfo, BaseResponse } from '../auth/authTypes';

// ---- Request Types ----
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  active?: boolean;
}

export interface UserFilterParams {
  keyword?: string;
  role?: string;
  active?: boolean;
  page: number;
  size: number;
}

// ---- Response Types ----
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---- User State ----
export interface UserState {
  users: UserInfo[];
  selectedUser: UserInfo | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  filters: {
    keyword: string;
    role: string;
  };
}

export type { UserInfo, BaseResponse };

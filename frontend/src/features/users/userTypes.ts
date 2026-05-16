import type { UserInfo, BaseResponse } from "../auth/authTypes";

// ---- Request Types / Các kiểu dữ liệu yêu cầu ----
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

// ---- Response Types / Các kiểu dữ liệu phản hồi ----
import type { PageResponse } from "../../types/common";

export type { PageResponse };

// ---- User State / Trạng thái người dùng ----
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

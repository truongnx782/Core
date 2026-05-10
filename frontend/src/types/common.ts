/**
 * Common Types and Interfaces
 * Nơi định nghĩa các kiểu dữ liệu dùng chung (response API, pagination)
 */

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

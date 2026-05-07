import axiosInstance from '../../services/axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse, BaseResponse } from './authTypes';

const AUTH_URL = '/auth';

export const authService = {
  login: (data: LoginRequest) =>
    axiosInstance.post<BaseResponse<AuthResponse>>(`${AUTH_URL}/login`, data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<BaseResponse<AuthResponse>>(`${AUTH_URL}/register`, data),

  refreshToken: () =>
    axiosInstance.post<BaseResponse<AuthResponse>>(`${AUTH_URL}/refresh-token`),

  logout: () =>
    axiosInstance.post(`${AUTH_URL}/logout`),
};

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserInfo } from "./authTypes";

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ---- Login / Đăng nhập ----
    // Request to login / Yêu cầu đăng nhập
    loginRequest: (
      state,
      action: PayloadAction<{ email: string; password: string }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>,
    ) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Register / Đăng ký ----
    // Request to register / Yêu cầu đăng ký tài khoản mới
    registerRequest: (
      state,
      action: PayloadAction<{
        username: string;
        email: string;
        password: string;
        fullName?: string;
      }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>,
    ) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Refresh Token / Làm mới Token ----
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },

    // ---- Logout / Đăng xuất ----
    // Logout action / Hành động đăng xuất
    logoutAction: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // ---- Clear Error / Xóa trạng thái lỗi ----
    // Clear current auth error / Xóa thông báo lỗi xác thực hiện tại
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  refreshTokenSuccess,
  logoutAction,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;

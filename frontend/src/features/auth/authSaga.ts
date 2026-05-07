import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from './authService';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutAction,
} from './authSlice';
import type { AxiosResponse } from 'axios';
import type { AuthResponse, BaseResponse } from './authTypes';

// ---- Login Saga ----
function* handleLogin(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const response: AxiosResponse<BaseResponse<AuthResponse>> = yield call(
      authService.login,
      action.payload
    );
    const { accessToken, user } = response.data.data;
    yield put(loginSuccess({ accessToken, user }));
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    yield put(loginFailure(message));
  }
}

// ---- Register Saga ----
function* handleRegister(
  action: PayloadAction<{ username: string; email: string; password: string; fullName?: string }>
) {
  try {
    const response: AxiosResponse<BaseResponse<AuthResponse>> = yield call(
      authService.register,
      action.payload
    );
    const { accessToken, user } = response.data.data;
    yield put(registerSuccess({ accessToken, user }));
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Registration failed';
    yield put(registerFailure(message));
  }
}

// ---- Logout Saga ----
function* handleLogout() {
  try {
    yield call(authService.logout);
  } catch {
    // Logout even if API call fails
  }
}

// ---- Watcher ----
export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logoutAction.type, handleLogout);
}

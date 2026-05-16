import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authService } from "./authService";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutAction,
} from "./authSlice";
import type { AuthResponse } from "./authTypes";

import { apiSaga } from "../../store/sagaHelper";
import i18n from "../../i18n/i18n";

// ---- Login Saga / Xử lý đăng nhập ----
function* handleLogin(
  action: PayloadAction<{ email: string; password: string }>,
) {
  yield* apiSaga({
    apiMethod: authService.login,
    actionPayload: action.payload,
    onFailure: loginFailure,
    errorMessage: i18n.t("common.error"),
    callback: function* (res: any) {
      const data = res.data as AuthResponse;
      yield put(
        loginSuccess({ accessToken: data.accessToken, user: data.user }),
      );
    },
  });
}

// ---- Register Saga / Xử lý đăng ký ----
function* handleRegister(
  action: PayloadAction<{
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }>,
) {
  yield* apiSaga({
    apiMethod: authService.register,
    actionPayload: action.payload,
    onFailure: registerFailure,
    errorMessage: i18n.t("common.error"),
    callback: function* (res: any) {
      const data = res.data as AuthResponse;
      yield put(
        registerSuccess({ accessToken: data.accessToken, user: data.user }),
      );
    },
  });
}

// ---- Logout Saga / Xử lý đăng xuất ----
function* handleLogout() {
  try {
    yield call(authService.logout);
  } catch {
    // Logout even if API call fails / Đăng xuất kể cả khi API lỗi
  }
}

// ---- Watcher / Theo dõi các actions ----
export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logoutAction.type, handleLogout);
}

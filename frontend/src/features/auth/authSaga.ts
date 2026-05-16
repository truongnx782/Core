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

// ---- Login Saga ----
function* handleLogin(
  action: PayloadAction<{ email: string; password: string }>,
) {
  yield* apiSaga({
    apiMethod: authService.login,
    actionPayload: action.payload,
    onFailure: loginFailure,
    errorMessage: "Login failed",
    callback: function* (data: AuthResponse) {
      yield put(
        loginSuccess({ accessToken: data.accessToken, user: data.user }),
      );
    },
  });
}

// ---- Register Saga ----
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
    errorMessage: "Registration failed",
    callback: function* (data: AuthResponse) {
      yield put(
        registerSuccess({ accessToken: data.accessToken, user: data.user }),
      );
    },
  });
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

import { put, takeLatest, select } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { userService } from "./userService";
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
} from "./userSlice";
import type {
  UserFilterParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserInfo,
} from "./userTypes";
import type { RootState } from "../../store";

import { apiSaga } from "../../store/sagaHelper";
import i18n from "../../i18n/i18n";

// ---- Fetch Users / Lấy danh sách người dùng ----
function* handleFetchUsers(action: PayloadAction<UserFilterParams>) {
  yield* apiSaga({
    apiMethod: userService.getUsers,
    actionPayload: action.payload,
    errorMessage: i18n.t("common.error"),
    callback: function* (pageData: unknown) {
      const data = pageData as {
        content: UserInfo[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
      yield put(
        fetchUsersSuccess({
          users: data.content,
          page: data.page,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        }),
      );
    },
  });
}

// Helper: re-fetch current page after mutation / Hàm hỗ trợ: tải lại trang hiện tại sau khi thay đổi dữ liệu
function* refetchUsers() {
  const state: RootState = yield select();
  const { pagination, filters } = state.users;
  yield put(
    fetchUsersRequest({
      keyword: filters.keyword,
      role: filters.role,
      page: pagination.page,
      size: pagination.size,
    }),
  );
}

// ---- Create User / Tạo người dùng ----
function* handleCreateUser(action: PayloadAction<CreateUserRequest>) {
  yield* apiSaga({
    apiMethod: userService.createUser,
    actionPayload: action.payload,
    onSuccess: createUserSuccess,
    onFailure: createUserFailure,
    successMessage: i18n.t("common.success"),
    errorMessage: i18n.t("common.error"),
    callback: refetchUsers,
  });
}

// ---- Update User / Cập nhật người dùng ----
function* handleUpdateUser(
  action: PayloadAction<{ id: number; data: UpdateUserRequest }>,
) {
  yield* apiSaga({
    apiMethod: () =>
      userService.updateUser(action.payload.id, action.payload.data),
    onSuccess: updateUserSuccess,
    onFailure: updateUserFailure,
    successMessage: i18n.t("common.success"),
    errorMessage: i18n.t("common.error"),
    callback: refetchUsers,
  });
}

// ---- Delete User / Xóa người dùng ----
function* handleDeleteUser(action: PayloadAction<number>) {
  yield* apiSaga({
    apiMethod: () => userService.deleteUser(action.payload),
    onSuccess: deleteUserSuccess,
    onFailure: deleteUserFailure,
    successMessage: i18n.t("common.success"),
    errorMessage: i18n.t("common.error"),
    callback: refetchUsers,
  });
}

// ---- Watcher / Theo dõi các actions ----
export default function* userSaga() {
  yield takeLatest(fetchUsersRequest.type, handleFetchUsers);
  yield takeLatest(createUserRequest.type, handleCreateUser);
  yield takeLatest(updateUserRequest.type, handleUpdateUser);
  yield takeLatest(deleteUserRequest.type, handleDeleteUser);
}

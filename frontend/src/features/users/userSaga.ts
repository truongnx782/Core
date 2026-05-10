import { put, takeLatest, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';

import { userService } from './userService';
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
} from './userSlice';
import type { UserFilterParams, CreateUserRequest, UpdateUserRequest } from './userTypes';
import type { RootState } from '../../store';


import { apiSaga } from '../../store/sagaHelper';

// ---- Fetch Users ----
function* handleFetchUsers(action: PayloadAction<UserFilterParams>) {
  yield* apiSaga({
    apiMethod: userService.getUsers,
    actionPayload: action.payload,
    errorMessage: 'Failed to fetch users',
    callback: function* (pageData: any) {
      yield put(
        fetchUsersSuccess({
          users: pageData.content,
          page: pageData.page,
          size: pageData.size,
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,
        })
      );
    }
  });
}

// Helper: re-fetch current page after mutation
function* refetchUsers() {
  const state: RootState = yield select();
  const { pagination, filters } = state.users;
  yield put(
    fetchUsersRequest({
      keyword: filters.keyword,
      role: filters.role,
      page: pagination.page,
      size: pagination.size,
    })
  );
}

// ---- Create User ----
function* handleCreateUser(action: PayloadAction<CreateUserRequest>) {
  yield* apiSaga({
    apiMethod: userService.createUser,
    actionPayload: action.payload,
    onSuccess: createUserSuccess,
    onFailure: createUserFailure,
    successMessage: 'User created successfully',
    errorMessage: 'Failed to create user',
    callback: refetchUsers
  });
}

// ---- Update User ----
function* handleUpdateUser(action: PayloadAction<{ id: number; data: UpdateUserRequest }>) {
  yield* apiSaga({
    apiMethod: () => userService.updateUser(action.payload.id, action.payload.data),
    onSuccess: updateUserSuccess,
    onFailure: updateUserFailure,
    successMessage: 'User updated successfully',
    errorMessage: 'Failed to update user',
    callback: refetchUsers
  });
}

// ---- Delete User ----
function* handleDeleteUser(action: PayloadAction<number>) {
  yield* apiSaga({
    apiMethod: () => userService.deleteUser(action.payload),
    onSuccess: deleteUserSuccess,
    onFailure: deleteUserFailure,
    successMessage: 'User deleted successfully',
    errorMessage: 'Failed to delete user',
    callback: refetchUsers
  });
}

// ---- Watcher ----
export default function* userSaga() {
  yield takeLatest(fetchUsersRequest.type, handleFetchUsers);
  yield takeLatest(createUserRequest.type, handleCreateUser);
  yield takeLatest(updateUserRequest.type, handleUpdateUser);
  yield takeLatest(deleteUserRequest.type, handleDeleteUser);
}

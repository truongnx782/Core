import { call, put, takeLatest, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { userService } from './userService';
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
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
import type { AxiosResponse } from 'axios';

// ---- Fetch Users ----
function* handleFetchUsers(action: PayloadAction<UserFilterParams>) {
  try {
    const response: AxiosResponse = yield call(userService.getUsers, action.payload);
    const pageData = response.data.data;
    yield put(
      fetchUsersSuccess({
        users: pageData.content,
        page: pageData.page,
        size: pageData.size,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
      })
    );
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to fetch users';
    yield put(fetchUsersFailure(msg));
  }
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
  try {
    yield call(userService.createUser, action.payload);
    yield put(createUserSuccess());
    message.success('User created successfully');
    yield* refetchUsers();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to create user';
    yield put(createUserFailure(msg));
    message.error(msg);
  }
}

// ---- Update User ----
function* handleUpdateUser(action: PayloadAction<{ id: number; data: UpdateUserRequest }>) {
  try {
    yield call(userService.updateUser, action.payload.id, action.payload.data);
    yield put(updateUserSuccess());
    message.success('User updated successfully');
    yield* refetchUsers();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to update user';
    yield put(updateUserFailure(msg));
    message.error(msg);
  }
}

// ---- Delete User ----
function* handleDeleteUser(action: PayloadAction<number>) {
  try {
    yield call(userService.deleteUser, action.payload);
    yield put(deleteUserSuccess());
    message.success('User deleted successfully');
    yield* refetchUsers();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to delete user';
    yield put(deleteUserFailure(msg));
    message.error(msg);
  }
}

// ---- Watcher ----
export default function* userSaga() {
  yield takeLatest(fetchUsersRequest.type, handleFetchUsers);
  yield takeLatest(createUserRequest.type, handleCreateUser);
  yield takeLatest(updateUserRequest.type, handleUpdateUser);
  yield takeLatest(deleteUserRequest.type, handleDeleteUser);
}

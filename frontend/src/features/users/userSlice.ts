import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserState, UserInfo, UserFilterParams, CreateUserRequest, UpdateUserRequest } from './userTypes';

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    keyword: '',
    role: '',
  },
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // ---- Fetch Users ----
    fetchUsersRequest: (state, action: PayloadAction<UserFilterParams>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (
      state,
      action: PayloadAction<{
        users: UserInfo[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>
    ) => {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination = {
        page: action.payload.page,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Create User ----
    createUserRequest: (state, action: PayloadAction<CreateUserRequest>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state) => {
      state.loading = false;
    },
    createUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Update User ----
    updateUserRequest: (
      state,
      action: PayloadAction<{ id: number; data: UpdateUserRequest }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state) => {
      state.loading = false;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Delete User ----
    deleteUserRequest: (state, action: PayloadAction<number>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      state.loading = false;
    },
    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Filters ----
    setKeyword: (state, action: PayloadAction<string>) => {
      state.filters.keyword = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.filters.role = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const {
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
  setKeyword,
  setRoleFilter,
  setSelectedUser,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;

import axiosInstance from '../../services/axiosInstance';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
  PageResponse,
  UserInfo,
  BaseResponse,
} from './userTypes';

const USERS_URL = '/users';

export const userService = {
  getUsers: (params: UserFilterParams) =>
    axiosInstance.get<BaseResponse<PageResponse<UserInfo>>>(USERS_URL, { params }),

  getUserById: (id: number) =>
    axiosInstance.get<BaseResponse<UserInfo>>(`${USERS_URL}/${id}`),

  createUser: (data: CreateUserRequest) =>
    axiosInstance.post<BaseResponse<UserInfo>>(USERS_URL, data),

  updateUser: (id: number, data: UpdateUserRequest) =>
    axiosInstance.put<BaseResponse<UserInfo>>(`${USERS_URL}/${id}`, data),

  deleteUser: (id: number) =>
    axiosInstance.delete<BaseResponse<void>>(`${USERS_URL}/${id}`),
};

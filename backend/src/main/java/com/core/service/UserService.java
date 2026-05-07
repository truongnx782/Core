package com.core.service;

import com.core.dto.request.CreateUserRequest;
import com.core.dto.request.UpdateUserRequest;
import com.core.dto.response.PageResponse;
import com.core.dto.response.UserResponse;

public interface UserService {

    PageResponse<UserResponse> getUsers(String keyword, String role, Boolean active, int page, int size);

    UserResponse getUserById(Long id);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);
}

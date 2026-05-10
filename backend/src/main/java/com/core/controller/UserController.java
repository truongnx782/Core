package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.CreateUserRequest;
import com.core.dto.request.UpdateUserRequest;
import com.core.dto.response.PageResponse;
import com.core.dto.response.UserResponse;
import com.core.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * User management REST endpoints.
 * All endpoints require ADMIN or MANAGER role (configured in SecurityConfig).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController extends BaseController {

    private final UserService userService;

    /**
     * List users with server-side pagination, search, and role filter.
     * Danh sách người dùng với phân trang, tìm kiếm và lọc theo vai trò.
     */
    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return success(userService.getUsers(keyword, role, active, page, size));
    }

    /**
     * Get single user by ID.
     * Lấy thông tin chi tiết một người dùng theo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return success(userService.getUserById(id));
    }

    /**
     * Create a new user.
     * Tạo một người dùng mới.
     */
    @PostMapping
    public ResponseEntity<BaseResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        return success(userService.createUser(request));
    }

    /**
     * Update an existing user.
     * Cập nhật thông tin người dùng hiện có.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return success(userService.updateUser(id, request));
    }

    /**
     * Soft-delete a user.
     * Xóa người dùng (xóa mềm).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return success("User deleted successfully");
    }
}

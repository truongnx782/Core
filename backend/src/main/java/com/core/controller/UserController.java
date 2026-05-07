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
public class UserController {

    private final UserService userService;

    /**
     * List users with server-side pagination, search, and role filter.
     */
    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<UserResponse> users = userService.getUsers(keyword, role, active, page, size);
        return ResponseEntity.ok(BaseResponse.success(users));
    }

    /**
     * Get single user by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(BaseResponse.success(user));
    }

    /**
     * Create a new user. Only ADMIN can create users.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("User created successfully", user));
    }

    /**
     * Update an existing user. Only ADMIN can update users.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(BaseResponse.success("User updated successfully", user));
    }

    /**
     * Soft-delete a user. Only ADMIN can delete users.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(BaseResponse.success("User deleted successfully"));
    }
}

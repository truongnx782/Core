package com.core.service.impl;

import com.core.common.ErrorCode;
import com.core.dto.mapper.UserMapper;
import com.core.dto.request.CreateUserRequest;
import com.core.dto.request.UpdateUserRequest;
import com.core.dto.response.PageResponse;
import com.core.dto.response.UserResponse;
import com.core.entity.Role;
import com.core.entity.User;
import com.core.repository.UserRepository;
import com.core.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(String keyword, String role, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Parse role filter
        Role roleEnum = parseRole(role);

        Page<User> userPage = userRepository.searchUsers(keyword, roleEnum, active, pageable);

        List<UserResponse> content = userPage.getContent().stream()
                .map(userMapper::toResponse)
                .toList();

        return PageResponse.of(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserOrThrow(id);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        validateUniqueFields(request.getEmail(), request.getUsername(), null);

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(parseRoleOrThrow(request.getRole()));

        user = userRepository.save(user);
        log.info("User created: {} ({})", user.getUsername(), user.getEmail());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);

        // Validate unique fields if changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException(ErrorCode.EMAIL_ALREADY_EXISTS.getMessage());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException(ErrorCode.USERNAME_ALREADY_EXISTS.getMessage());
            }
            user.setUsername(request.getUsername());
        }

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(parseRoleOrThrow(request.getRole()));
        if (request.getActive() != null) user.setActive(request.getActive());

        user = userRepository.save(user);
        log.info("User updated: {} (ID: {})", user.getUsername(), user.getId());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        // Soft delete
        user.setActive(false);
        userRepository.save(user);
        log.info("User soft-deleted: {} (ID: {})", user.getUsername(), id);
    }

    // ---- Private helper methods (DRY) ----

    /**
     * Tìm User theo ID hoặc ném lỗi nếu không tồn tại.
     * Find User by ID or throw exception if not found.
     */
    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) return null;
        try {
            return Role.valueOf("ROLE_" + role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // Ignore invalid role filters silently
        }
    }

    private Role parseRoleOrThrow(String role) {
        try {
            return Role.valueOf("ROLE_" + role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(ErrorCode.INVALID_ROLE.getMessage());
        }
    }

    private void validateUniqueFields(String email, String username, Long excludeId) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(ErrorCode.EMAIL_ALREADY_EXISTS.getMessage());
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(ErrorCode.USERNAME_ALREADY_EXISTS.getMessage());
        }
    }
}

package com.core.service;

import com.core.dto.request.LoginRequest;
import com.core.dto.request.RegisterRequest;
import com.core.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refreshToken(String refreshTokenValue);

    void logout(String refreshTokenValue);

    /**
     * Generate a new refresh token string for a user.
     * Stores the token in the database and returns the raw token value.
     */
    String createRefreshToken(Long userId);
}

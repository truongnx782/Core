package com.core.service.impl;

import com.core.common.ErrorCode;
import com.core.dto.mapper.UserMapper;
import com.core.dto.request.LoginRequest;
import com.core.dto.request.RegisterRequest;
import com.core.dto.response.AuthResponse;
import com.core.entity.RefreshToken;
import com.core.entity.Role;
import com.core.entity.User;
import com.core.repository.RefreshTokenRepository;
import com.core.repository.UserRepository;
import com.core.security.UserPrincipal;
import com.core.security.jwt.JwtProperties;
import com.core.security.jwt.JwtTokenProvider;
import com.core.service.AuthService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));

        log.info("User logged in: {}", user.getEmail());
        return AuthResponse.of(accessToken, userMapper.toResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(ErrorCode.EMAIL_ALREADY_EXISTS.getMessage());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException(ErrorCode.USERNAME_ALREADY_EXISTS.getMessage());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();

        user = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);

        log.info("New user registered: {}", user.getEmail());
        return AuthResponse.of(accessToken, userMapper.toResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(refreshTokenValue)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.REFRESH_TOKEN_NOT_FOUND.getMessage()));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new IllegalArgumentException(ErrorCode.REFRESH_TOKEN_EXPIRED.getMessage());
        }

        // Rotate: revoke old, create new
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);

        log.info("Token refreshed for user: {}", user.getEmail());
        return AuthResponse.of(newAccessToken, userMapper.toResponse(user));
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .ifPresent(token -> {
                    // Revoke all tokens for this user (force logout everywhere)
                    refreshTokenRepository.revokeAllByUser(token.getUser());
                    log.info("User logged out: {}", token.getUser().getEmail());
                });
    }

    @Override
    @Transactional
    public String createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));

        String tokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }
}

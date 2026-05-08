package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.LoginRequest;
import com.core.dto.request.RegisterRequest;
import com.core.dto.response.AuthResponse;
import com.core.security.UserPrincipal;
import com.core.security.jwt.JwtProperties;
import com.core.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

/**
 * Authentication endpoints: login, register, refresh-token, logout.
 * AccessToken returned in JSON body; RefreshToken stored in HttpOnly cookie.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);

        // Create refresh token and set as HttpOnly cookie
        String refreshToken = authService.createRefreshToken(authResponse.getUser().getId());
        addRefreshTokenCookie(response, refreshToken);

        return ResponseEntity.ok(BaseResponse.success("Login successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.register(request);

        // Create refresh token and set as HttpOnly cookie
        String refreshToken = authService.createRefreshToken(authResponse.getUser().getId());
        addRefreshTokenCookie(response, refreshToken);

        return ResponseEntity.ok(BaseResponse.success("Registration successful", authResponse));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshTokenValue = extractRefreshTokenFromCookie(request);
        if (refreshTokenValue == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("Refresh token not found"));
        }

        AuthResponse authResponse = authService.refreshToken(refreshTokenValue, true);

        // Rotate: issue new refresh token cookie
//        String newRefreshToken = authService.createRefreshToken(authResponse.getUser().getId());
//        addRefreshTokenCookie(response, newRefreshToken);

        return ResponseEntity.ok(BaseResponse.success("Token refreshed", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshTokenValue = extractRefreshTokenFromCookie(request);
        if (refreshTokenValue != null) {
            authService.logout(refreshTokenValue);
        }

        // Clear the cookie
        clearRefreshTokenCookie(response);

        return ResponseEntity.ok(BaseResponse.success("Logout successful"));
    }

    // ---- Private helper methods (DRY) ----

    private void addRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true in production (HTTPS)
        cookie.setPath("/api/auth");
        cookie.setMaxAge((int) (jwtProperties.getRefreshTokenExpirationMs() / 1000));
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}

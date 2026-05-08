package com.core.common;

import lombok.Getter;

/**
 * Centralized error codes for consistent error handling.
 */
@Getter
public enum ErrorCode {

    // Auth errors
    INVALID_CREDENTIALS("AUTH_001", "Invalid email or password"),
    TOKEN_EXPIRED("AUTH_002", "Token has expired"),
    TOKEN_INVALID("AUTH_003", "Invalid token"),
    REFRESH_TOKEN_NOT_FOUND("AUTH_004", "Refresh token not found"),
    REFRESH_TOKEN_EXPIRED("AUTH_005", "Refresh token has expired"),

    // User errors
    USER_NOT_FOUND("USER_001", "User not found"),
    EMAIL_ALREADY_EXISTS("USER_002", "Email already exists"),
    USERNAME_ALREADY_EXISTS("USER_003", "Username already exists"),
    INVALID_ROLE("USER_004", "Invalid role specified"),

    // Exam errors
    EXAM_NOT_FOUND("EXAM_001", "Exam not found"),

    // General errors
    VALIDATION_ERROR("GEN_001", "Validation error"),
    ACCESS_DENIED("GEN_002", "Access denied"),
    INTERNAL_ERROR("GEN_003", "Internal server error");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}

package com.core.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Common fields for user requests (Create/Update).
 * DTO dùng chung cho các request liên quan đến User.
 */
@Data
public abstract class BaseUserRequest {

    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;
}

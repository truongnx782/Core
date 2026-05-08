package com.core.util;

import com.core.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helper methods to access the current authenticated user.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Unauthenticated");
        }
        return principal;
    }

    public static Long getCurrentUserId() {
        return getCurrentPrincipal().getId();
    }
}


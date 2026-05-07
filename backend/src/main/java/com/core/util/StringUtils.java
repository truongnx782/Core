package com.core.util;

/**
 * Common string utility methods.
 */
public final class StringUtils {

    private StringUtils() {
        // Utility class — prevent instantiation
    }

    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    public static String capitalize(String str) {
        if (isBlank(str)) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public static String slugify(String str) {
        if (isBlank(str)) return str;
        return str.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s+]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    public static String truncate(String str, int maxLength) {
        if (isBlank(str) || str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }

    public static String maskEmail(String email) {
        if (isBlank(email) || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        if (name.length() <= 2) return name + "@" + parts[1];
        return name.substring(0, 2) + "***@" + parts[1];
    }
}

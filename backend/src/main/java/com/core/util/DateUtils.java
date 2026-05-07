package com.core.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Common date/time utility methods.
 */
public final class DateUtils {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private DateUtils() {
        // Utility class — prevent instantiation
    }

    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DEFAULT_FORMATTER) : null;
    }

    public static String format(LocalDateTime dateTime, String pattern) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern(pattern)) : null;
    }

    public static String formatDateOnly(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_ONLY) : null;
    }

    public static LocalDateTime parse(String dateString) {
        return LocalDateTime.parse(dateString, DEFAULT_FORMATTER);
    }

    public static boolean isExpired(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    public static String timeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        long minutes = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " minute(s) ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hour(s) ago";
        long days = hours / 24;
        if (days < 30) return days + " day(s) ago";
        long months = days / 30;
        return months + " month(s) ago";
    }
}

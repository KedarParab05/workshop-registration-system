package com.workshophub.util;

import java.util.regex.Pattern;

/**
 * Centralized validation utilities for security hardening and data integrity.
 * Strictly verifies phone numbers, passwords, emails, and names on the backend.
 */
public final class ValidationUtils {

    private static final Pattern INDIAN_PHONE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private ValidationUtils() {}

    /**
     * Validates Indian mobile number format:
     * - Exactly 10 digits
     * - Numeric characters only
     * - Starts with 6, 7, 8, or 9
     * - Gracefully cleans +91, 91, 0, spaces, and hyphens
     */
    public static String validateAndCleanIndianPhone(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required.");
        }

        String trimmed = input.trim();

        // Reject if letters exist
        if (trimmed.matches(".*[a-zA-Z].*")) {
            throw new IllegalArgumentException("Phone number cannot contain letters.");
        }

        // Clean prefix if user sent with +91 or leading 0, plus any spaces, hyphens, parens
        String digitsOnly = trimmed.replaceAll("\\D", "");
        if (digitsOnly.length() == 12 && digitsOnly.startsWith("91")) {
            digitsOnly = digitsOnly.substring(2);
        } else if (digitsOnly.length() == 11 && digitsOnly.startsWith("0")) {
            digitsOnly = digitsOnly.substring(1);
        }

        if (digitsOnly.length() < 10) {
            throw new IllegalArgumentException("Phone number is too short (" + digitsOnly.length() + "/10 digits). Please enter 10 digits.");
        }
        if (digitsOnly.length() > 10) {
            throw new IllegalArgumentException("Phone number is too long (" + digitsOnly.length() + " digits). Please enter 10 digits.");
        }

        if (!INDIAN_PHONE_PATTERN.matcher(digitsOnly).matches()) {
            throw new IllegalArgumentException("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
        }

        return digitsOnly;
    }

    /**
     * Validates password complexity:
     * - Minimum 6 characters
     * - At least one uppercase letter (A-Z)
     * - At least one lowercase letter (a-z)
     * - At least one digit (0-9)
     */
    public static void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters and include one uppercase letter, one lowercase letter and one number.");
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
        }

        if (!hasUpper || !hasLower || !hasDigit) {
            throw new IllegalArgumentException("Password must be at least 6 characters and include one uppercase letter, one lowercase letter and one number.");
        }
    }

    /**
     * Validates full name:
     * - At least 2 characters
     * - Not whitespace-only
     */
    public static String validateFullName(String name) {
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Full name must be at least 2 characters.");
        }
        return name.trim();
    }

    /**
     * Validates email formatting
     */
    public static String validateEmail(String email) {
        if (email == null || email.trim().isEmpty() || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        return email.trim().toLowerCase();
    }
}

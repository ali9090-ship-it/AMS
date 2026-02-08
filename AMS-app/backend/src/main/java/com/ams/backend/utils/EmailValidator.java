package com.ams.backend.utils;
public class EmailValidator {
    private static final String STUDENT_PATTERN =
            "^[a-z]+\\.\\d+\\.[a-z]+@mhssce\\.ac\\.in$";
    private static final String TEACHER_PATTERN =
            "^[a-z]+\\.[a-z]+@mhssce\\.ac\\.in$";
    private static final String ADMIN_PATTERN =
            "^admin\\.[a-z]+@mhssce\\.ac\\.in$";
    public static boolean isValidStudent(String email) {
        if (email == null) return false;
        return email.toLowerCase().matches(STUDENT_PATTERN);
    }
    public static boolean isValidTeacher(String email) {if (email == null) return false;
        String lower = email.toLowerCase();
        return lower.matches(TEACHER_PATTERN) &&
                !lower.matches(STUDENT_PATTERN) &&
                !lower.startsWith("admin.");
    }
    public static boolean isValidAdmin(String email) {
        if (email == null) return false;
        return email.toLowerCase().matches(ADMIN_PATTERN);
    }
    public static String getUserType(String email) {
        if (email == null) return null;
        String lower = email.toLowerCase();
        if (isValidStudent(lower)) {
            return "STUDENT";
        } else if (isValidAdmin(lower)) {
            return "ADMIN";
        } else if (isValidTeacher(lower)) {
            return "TEACHER";
        }
        return null;
    }
    public static String extractInfo(String email) {
        if (email == null) return null;
        String lower = email.toLowerCase();
        String[] parts = lower.split("@")[0].split("\\.");
        StringBuilder info = new StringBuilder();
        for (String part : parts) {
            if (!info.isEmpty()) info.append(" | ");
            info.append(part);}
        return info.toString();
    }
    public static boolean isDomainValid(String email) {
        if (email == null) return false;
        return email.toLowerCase().endsWith("@mhssce.ac.in");
    }
}

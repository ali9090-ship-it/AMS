package com.ams.backend.utils;
public class Constants {
    // Email Domains
    public static final String ALLOWED_DOMAIN = "@mhssce.ac.in";// Attendance Thresholds
    public static final double SAFE_ATTENDANCE = 75.0;
    public static final double RISK_ATTENDANCE = 65.0;
    public static final double CRITICAL_ATTENDANCE = 0.0;
    // Marks Configuration
    public static final int MAX_INTERNAL_MARKS = 30;
    public static final int MAX_EXTERNAL_MARKS = 70;
    public static final int TOTAL_MARKS = 100;
    public static final int PASS_MARKS = 40;
    // Semester Range
    public static final int MIN_SEMESTER = 1;
    public static final int MAX_SEMESTER = 8;
    // Branches
    public static final String[] BRANCHES = {"CSE", "ETC", "MECH", "CIVIL", "AIML"};
    // User Roles
    public static final String ROLE_STUDENT = "STUDENT";
    public static final String ROLE_TEACHER = "TEACHER";
    public static final String ROLE_ADMIN = "ADMIN";
    // Firebase Collections (for later)
    public static final String COLLECTION_STUDENTS = "students";
    public static final String COLLECTION_TEACHERS = "teachers";
    public static final String COLLECTION_SUBJECTS = "subjects";
    public static final String COLLECTION_ATTENDANCE = "attendance";
    public static final String COLLECTION_MARKS = "marks";
    public static final String COLLECTION_NOTES = "notes";
    public static final String COLLECTION_ASSIGNMENTS = "assignments";
}

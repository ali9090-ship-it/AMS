package com.ams.backend.entities;

public class Student {

    private String studentId;      // Unique ID from Firebase
    private String uid;            // Firebase UID
    private String name;           // Student name
    private String email;          // Full email address
    private String rollNo;         // Roll number (22IT001)
    private String branch;         // CSE, ETC, MECH, etc.
    private int semester;          // Current semester (1-8)
    private String profileImageUrl; // Firebase Storage URL
    private long createdAt;        // Timestamp
    private boolean isActive;      // Account status

    public Student() {}

    public Student(String studentId, String uid, String name, String email,
                   String rollNo, String branch, int semester) {
        this.studentId = studentId;
        this.uid = uid;
        this.name = name;
        this.email = email;
        this.rollNo = rollNo;
        this.branch = branch;
        this.semester = semester;
        this.createdAt = System.currentTimeMillis();
        this.isActive = true;
    }

    public String getStudentId() { return studentId; }
    public String getUid() { return uid; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRollNo() { return rollNo; }
    public String getBranch() { return branch; }
    public int getSemester() { return semester; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public long getCreatedAt() { return createdAt; }
    public boolean isActive() { return isActive; }

    public void setName(String name) { this.name = name; }
    public void setSemester(int semester) { this.semester = semester; }
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    public void setActive(boolean active) { isActive = active; }
}

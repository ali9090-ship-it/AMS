package com.ams.backend.entities;

import java.util.List;

public class Teacher {

    private String teacherId;
    private String uid;
    private String name;
    private String email;
    private String branch;
    private List<String> subjectIds; // Subjects taught
    private String department;
    private String designation; // Assistant Professor, etc.
    private String profileImageUrl;
    private long createdAt;
    private boolean isActive;

    public Teacher() {}

    public Teacher(String teacherId, String uid, String name, String email,
                   String branch, String department, String designation) {
        this.teacherId = teacherId;
        this.uid = uid;
        this.name = name;
        this.email = email;
        this.branch = branch;
        this.department = department;
        this.designation = designation;
        this.createdAt = System.currentTimeMillis();
        this.isActive = true;
    }

    // Getters
    public String getTeacherId() { return teacherId; }
    public String getUid() { return uid; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getBranch() { return branch; }
    public List<String> getSubjectIds() { return subjectIds; }
    public String getDepartment() { return department; }
    public String getDesignation() { return designation; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public long getCreatedAt() { return createdAt; }
    public boolean isActive() { return isActive; }

    // Setters
    public void setSubjectIds(List<String> subjectIds) {
        this.subjectIds = subjectIds;
    }
    public void setDesignation(String designation) {
        this.designation = designation;
    }
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    public void setActive(boolean active) {
        isActive = active;
    }
}

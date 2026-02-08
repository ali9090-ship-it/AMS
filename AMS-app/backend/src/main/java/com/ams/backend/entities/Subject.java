package com.ams.backend.entities;

public class Subject {

    private String subjectId; // Unique subject identifier
    private String name; // Subject name (e.g., "Database Systems")
    private String code; // Subject code (e.g., "CS301")
    private String type; // "Theory", "Practical", "Lab"
    private int credits; // Credit hours
    private String branch; // Branch offered (CSE, ETC, etc.)
    private int semester; // Semester (1-8)
    private String teacherId; // Assigned teacher
    private long createdAt;
    private boolean isActive;

    public Subject() {}

    public Subject(String subjectId, String name, String code, String type,
                   int credits, String branch, int semester) {
        this.subjectId = subjectId;
        this.name = name;
        this.code = code;
        this.type = type;
        this.credits = credits;
        this.branch = branch;
        this.semester = semester;
        this.createdAt = System.currentTimeMillis();
        this.isActive = true;
    }

    // Getters
    public String getSubjectId() { return subjectId; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getType() { return type; }
    public int getCredits() { return credits; }
    public String getBranch() { return branch; }
    public int getSemester() { return semester; }
    public String getTeacherId() { return teacherId; }
    public long getCreatedAt() { return createdAt; }
    public boolean isActive() { return isActive; }

    // Setters
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public void setActive(boolean active) { isActive = active; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}

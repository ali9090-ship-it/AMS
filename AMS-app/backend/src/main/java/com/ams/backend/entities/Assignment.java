package com.ams.backend.entities;

import java.util.ArrayList;
import java.util.List;

public class Assignment {

    private String assignmentId;
    private String subjectId;
    private String teacherId;
    private String title;
    private String description;
    private String problemStatement; // Full problem description
    private long dueDate;
    private int totalMarks;
    private List<String> submittedBy; // Student IDs who submitted
    private long createdAt;
    private long lastUpdated;
    private boolean isActive;

    public Assignment() {}

    public Assignment(String assignmentId, String subjectId, String teacherId,
                      String title, String description, long dueDate, int totalMarks) {
        this.assignmentId = assignmentId;
        this.subjectId = subjectId;
        this.teacherId = teacherId;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.totalMarks = totalMarks;
        this.submittedBy = new ArrayList<>();
        this.createdAt = System.currentTimeMillis();
        this.lastUpdated = this.createdAt;
        this.isActive = true;
    }

    public boolean isOverdue() {
        return System.currentTimeMillis() > dueDate;
    }

    public void recordSubmission(String studentId) {
        if (!submittedBy.contains(studentId)) {
            submittedBy.add(studentId);
            this.lastUpdated = System.currentTimeMillis();
        }
    }

    public void close() {
        this.isActive = false;
        this.lastUpdated = System.currentTimeMillis();
    }

    // Getters
    public String getAssignmentId() { return assignmentId; }
    public String getSubjectId() { return subjectId; }
    public String getTeacherId() { return teacherId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getProblemStatement() { return problemStatement; }
    public long getDueDate() { return dueDate; }
    public int getTotalMarks() { return totalMarks; }
    public List<String> getSubmittedBy() { return submittedBy; }
    public boolean isActive() { return isActive; }
    public long getCreatedAt() { return createdAt; }
    public long getLastUpdated() { return lastUpdated; }

    // Setters
    public void setProblemStatement(String problemStatement) {
        this.problemStatement = problemStatement;
        this.lastUpdated = System.currentTimeMillis();
    }

    public void setActive(boolean active) {
        isActive = active;
        this.lastUpdated = System.currentTimeMillis();
    }
}

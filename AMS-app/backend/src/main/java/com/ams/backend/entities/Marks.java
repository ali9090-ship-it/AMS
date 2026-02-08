package com.ams.backend.entities;

public class Marks {

    private String marksId;
    private String studentId;
    private String subjectId;
    private int internalMarks; // 0-30
    private int externalMarks; // 0-70
    private int totalMarks; // 0-100
    private String grade; // A+, A, B, C, D, F
    private String status; // Pass, Fail, Pending
    private long createdAt;
    private long lastUpdated;

    public Marks() {}

    public Marks(String marksId, String studentId, String subjectId) {
        this.marksId = marksId;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.createdAt = System.currentTimeMillis();
        this.lastUpdated = this.createdAt;
    }

    public void setMarks(int internal, int external) {
        this.internalMarks = Math.min(internal, 30);
        this.externalMarks = Math.min(external, 70);
        calculateTotal();
    }

    private void calculateTotal() {
        this.totalMarks = internalMarks + externalMarks;
        assignGrade();
        this.lastUpdated = System.currentTimeMillis();
    }

    private void assignGrade() {
        if (totalMarks < 40) {
            this.grade = "F";
            this.status = "Fail";
        } else if (totalMarks < 50) {
            this.grade = "D";
            this.status = "Pass";
        } else if (totalMarks < 60) {
            this.grade = "C";
            this.status = "Pass";
        } else if (totalMarks < 70) {
            this.grade = "B";
            this.status = "Pass";
        } else if (totalMarks < 80) {
            this.grade = "A";
            this.status = "Pass";
        } else {
            this.grade = "A+";
            this.status = "Pass";
        }
    }

    // Getters
    public String getMarksId() { return marksId; }
    public String getStudentId() { return studentId; }
    public String getSubjectId() { return subjectId; }
    public int getInternalMarks() { return internalMarks; }
    public int getExternalMarks() { return externalMarks; }
    public int getTotalMarks() { return totalMarks; }
    public String getGrade() { return grade; }
    public String getStatus() { return status; }
    public long getCreatedAt() { return createdAt; }
    public long getLastUpdated() { return lastUpdated; }
}

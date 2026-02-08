package com.ams.backend.entities;

public class Attendance {

    private String attendanceId;
    private String studentId;
    private String subjectId;
    private int totalClasses;
    private int attended;
    private double percentage;
    private String status;
    private long lastUpdated;

    public Attendance() {}

    public Attendance(String attendanceId, String studentId, String subjectId,
                      int totalClasses, int attended,
                      double percentage, String status, long lastUpdated) {
        this.attendanceId = attendanceId;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.totalClasses = totalClasses;
        this.attended = attended;
        this.percentage = percentage;
        this.status = status;
        this.lastUpdated = lastUpdated;
    }

    // getters setters
    public String getAttendanceId() { return attendanceId; }
    public void setAttendanceId(String attendanceId) { this.attendanceId = attendanceId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public int getTotalClasses() { return totalClasses; }
    public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

    public int getAttended() { return attended; }
    public void setAttended(int attended) { this.attended = attended; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(long lastUpdated) { this.lastUpdated = lastUpdated; }
}

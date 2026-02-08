package com.ams.backend.dto;

import java.util.List;

public class DashboardResponse {

    public double averageAttendance;
    public int safeSubjects;
    public int riskSubjects;
    public int criticalSubjects;

    public double averageMarks;
    public int passedSubjects;
    public int failedSubjects;

    public List<String> alerts;

    public DashboardResponse(double avgAtt, int safe, int risk, int critical,
                             double avgMarks, int passed, int failed,
                             List<String> alerts) {
        this.averageAttendance = avgAtt;
        this.safeSubjects = safe;
        this.riskSubjects = risk;
        this.criticalSubjects = critical;
        this.averageMarks = avgMarks;
        this.passedSubjects = passed;
        this.failedSubjects = failed;
        this.alerts = alerts;
    }
}

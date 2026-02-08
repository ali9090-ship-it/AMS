package com.ams.backend.services;

import com.ams.backend.entities.Attendance;
import com.ams.backend.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository repo;

    public AttendanceService(@Qualifier("firebaseAttendanceRepository")
                             AttendanceRepository repo) {
        this.repo = repo;
    }

    public void createAttendanceRecord(String studentId, String subjectId) {
        Attendance existing = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        if (existing != null) return;

        Attendance a = new Attendance();
        a.setAttendanceId(studentId + "_" + subjectId);
        a.setStudentId(studentId);
        a.setSubjectId(subjectId);
        a.setTotalClasses(0);
        a.setAttended(0);
        a.setPercentage(0);
        a.setStatus("Risk");
        a.setLastUpdated(System.currentTimeMillis());

        repo.save(a);
    }

    public void markPresent(String studentId, String subjectId) {
        Attendance a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        if (a == null) {
            createAttendanceRecord(studentId, subjectId);
            a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        }

        a.setTotalClasses(a.getTotalClasses() + 1);
        a.setAttended(a.getAttended() + 1);
        updateStats(a);
        repo.update(a);
    }

    public void markAbsent(String studentId, String subjectId) {
        Attendance a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        if (a == null) {
            createAttendanceRecord(studentId, subjectId);
            a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        }

        a.setTotalClasses(a.getTotalClasses() + 1);
        updateStats(a);
        repo.update(a);
    }

    private void updateStats(Attendance a) {
        double percent = (a.getTotalClasses() == 0)
                ? 0
                : (a.getAttended() * 100.0) / a.getTotalClasses();

        a.setPercentage(percent);

        if (percent >= 75) a.setStatus("Safe");
        else if (percent >= 50) a.setStatus("Risk");
        else a.setStatus("Critical");

        a.setLastUpdated(System.currentTimeMillis());
    }

    public double getAttendancePercentage(String studentId, String subjectId) {
        Attendance a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        return a == null ? 0 : a.getPercentage();
    }

    public String getAttendanceStatus(String studentId, String subjectId) {
        Attendance a = repo.findByStudentIdAndSubjectId(studentId, subjectId);
        return a == null ? "No Record" : a.getStatus();
    }

    public List<Attendance> getStudentAttendance(String studentId) {
        return repo.findByStudentId(studentId);
    }

    public List<Attendance> getSubjectAttendance(String subjectId) {
        return repo.findBySubjectId(subjectId);
    }
}

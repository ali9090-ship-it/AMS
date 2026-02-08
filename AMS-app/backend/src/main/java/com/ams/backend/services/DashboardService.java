package com.ams.backend.services;

import com.ams.backend.dto.DashboardResponse;
import com.ams.backend.entities.Attendance;
import com.ams.backend.entities.Marks;
import com.ams.backend.repository.AttendanceRepository;
import com.ams.backend.repository.MarksRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;

    public DashboardService(
            @Qualifier("firebaseAttendanceRepository")
            AttendanceRepository attendanceRepository,

            @Qualifier("firebaseMarksRepository")
            MarksRepository marksRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
    }

    public DashboardResponse getStudentDashboard(String studentId) {

        // ✅ FIXED METHOD NAME
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);

        int safe = 0, risk = 0, critical = 0;
        double totalAttendance = 0;
        List<String> alerts = new ArrayList<>();

        for (Attendance a : records) {
            totalAttendance += a.getPercentage();

            if ("Safe".equals(a.getStatus())) {
                safe++;
            } else if ("Risk".equals(a.getStatus())) {
                risk++;
            } else if ("Critical".equals(a.getStatus())) {
                critical++;
                alerts.add("CRITICAL attendance in subject: " + a.getSubjectId());
            }
        }

        double avgAttendance = records.isEmpty() ? 0 : totalAttendance / records.size();

        List<Marks> marksList = marksRepository.findByStudent(studentId);

        int pass = 0, fail = 0;
        double totalMarks = 0;

        for (Marks m : marksList) {
            totalMarks += m.getTotalMarks();

            if ("Pass".equals(m.getStatus())) {
                pass++;
            } else {
                fail++;
            }
        }

        double avgMarks = marksList.isEmpty() ? 0 : totalMarks / marksList.size();

        if (fail > 0) {
            alerts.add("FAILED subjects count: " + fail);
        }

        return new DashboardResponse(
                avgAttendance,
                safe,
                risk,
                critical,
                avgMarks,
                pass,
                fail,
                alerts
        );
    }
}

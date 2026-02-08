package com.ams.backend.repository;

import com.ams.backend.entities.Attendance;
import java.util.List;

public interface AttendanceRepository {

    void save(Attendance attendance);

    void update(Attendance attendance);

    Attendance findByStudentIdAndSubjectId(String studentId, String subjectId);

    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findBySubjectId(String subjectId);
}

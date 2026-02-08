package com.ams.backend.repository.mock;

import com.ams.backend.entities.Attendance;
import com.ams.backend.repository.AttendanceRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository("mockAttendanceRepository")
public class MockAttendanceRepository implements AttendanceRepository {

    private final Map<String, Attendance> store = new HashMap<>();

    private String key(String studentId, String subjectId) {
        return studentId + "_" + subjectId;
    }

    @Override
    public void save(Attendance attendance) {
        store.put(key(attendance.getStudentId(), attendance.getSubjectId()), attendance);
    }

    @Override
    public void update(Attendance attendance) {
        store.put(key(attendance.getStudentId(), attendance.getSubjectId()), attendance);
    }

    @Override
    public Attendance findByStudentIdAndSubjectId(String studentId, String subjectId) {
        return store.get(key(studentId, subjectId));
    }

    @Override
    public List<Attendance> findByStudentId(String studentId) {
        List<Attendance> list = new ArrayList<>();
        for (Attendance a : store.values()) {
            if (a.getStudentId().equals(studentId)) {
                list.add(a);
            }
        }
        return list;
    }

    @Override
    public List<Attendance> findBySubjectId(String subjectId) {
        List<Attendance> list = new ArrayList<>();
        for (Attendance a : store.values()) {
            if (a.getSubjectId().equals(subjectId)) {
                list.add(a);
            }
        }
        return list;
    }
}

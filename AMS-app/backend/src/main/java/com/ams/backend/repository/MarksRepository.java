package com.ams.backend.repository;

import com.ams.backend.entities.Marks;
import java.util.List;

public interface MarksRepository {

    void save(Marks marks);
    void update(Marks marks);

    Marks findByMarksId(String marksId);
    Marks findByStudentAndSubject(String studentId, String subjectId);

    List<Marks> findByStudent(String studentId);
    List<Marks> findBySubject(String subjectId);
    List<Marks> findByGrade(String grade);

    void delete(String marksId);
    boolean exists(String marksId);
}

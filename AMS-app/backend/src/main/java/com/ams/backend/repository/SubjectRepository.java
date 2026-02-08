package com.ams.backend.repository;

import com.ams.backend.entities.Subject;
import java.util.List;

public interface SubjectRepository {

    void save(Subject subject);
    void update(Subject subject);

    Subject findBySubjectId(String subjectId);
    Subject findByCode(String code);

    List<Subject> findAll();
    List<Subject> findByBranch(String branch);
    List<Subject> findByBranchAndSemester(String branch, int semester);
    List<Subject> findByTeacher(String teacherId);

    void delete(String subjectId);
    boolean exists(String subjectId);
}

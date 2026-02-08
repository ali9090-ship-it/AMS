package com.ams.backend.repository;

import com.ams.backend.entities.Teacher;
import java.util.List;

public interface TeacherRepository {

    void save(Teacher teacher);
    void update(Teacher teacher);

    Teacher findByTeacherId(String teacherId);
    Teacher findByUid(String uid);
    Teacher findByEmail(String email);

    List<Teacher> findAll();

    void delete(String teacherId);
    boolean exists(String teacherId);
}

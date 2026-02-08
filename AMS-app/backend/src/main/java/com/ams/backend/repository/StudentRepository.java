package com.ams.backend.repository;

import com.ams.backend.entities.Student;
import java.util.List;

public interface StudentRepository {

    // Create / Update
    void save(Student student);
    void update(Student student);

    // Read
    Student findByStudentId(String studentId);
    Student findByUid(String uid);
    Student findByEmail(String email);
    Student findByRollNo(String rollNo);

    // Read multiple
    List<Student> findAll();
    List<Student> findByBranch(String branch);
    List<Student> findBySemester(int semester);
    List<Student> findByBranchAndSemester(String branch, int semester);

    // Delete
    void delete(String studentId);
    void deleteByUid(String uid);

    // Check
    boolean exists(String studentId);
}

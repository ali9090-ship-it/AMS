package com.ams.backend.repository.mock;

import com.ams.backend.entities.Student;
import com.ams.backend.repository.StudentRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository   // 🔴 THIS IS REQUIRED
public class MockStudentRepository implements StudentRepository {

    private final Map<String, Student> store = new HashMap<>();
    private static int idCounter = 1000;

    @Override
    public void save(Student student) {
        if (student.getStudentId() == null) {
            student = new Student(
                    "STU" + (idCounter++),
                    student.getUid(),
                    student.getName(),
                    student.getEmail(),
                    student.getRollNo(),
                    student.getBranch(),
                    student.getSemester()
            );
        }
        store.put(student.getStudentId(), student);
    }

    @Override
    public void update(Student student) {
        store.put(student.getStudentId(), student);
    }

    @Override
    public Student findByStudentId(String studentId) {
        return store.get(studentId);
    }

    @Override
    public Student findByUid(String uid) {
        return store.values().stream()
                .filter(s -> uid.equals(s.getUid()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Student findByEmail(String email) {
        return store.values().stream()
                .filter(s -> email.equals(s.getEmail()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Student findByRollNo(String rollNo) {
        return store.values().stream()
                .filter(s -> rollNo.equals(s.getRollNo()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<Student> findByBranch(String branch) {
        return store.values().stream()
                .filter(s -> branch.equals(s.getBranch()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> findBySemester(int semester) {
        return store.values().stream()
                .filter(s -> s.getSemester() == semester)
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> findByBranchAndSemester(String branch, int semester) {
        return store.values().stream()
                .filter(s -> branch.equals(s.getBranch()) && s.getSemester() == semester)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String studentId) {
        store.remove(studentId);
    }

    @Override
    public void deleteByUid(String uid) {
        Student student = findByUid(uid);
        if (student != null) {
            store.remove(student.getStudentId());
        }
    }

    @Override
    public boolean exists(String studentId) {
        return store.containsKey(studentId);
    }
}

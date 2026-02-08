package com.ams.backend.repository.mock;

import com.ams.backend.entities.Subject;
import com.ams.backend.repository.SubjectRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository   // 🔴 REQUIRED
public class MockSubjectRepository implements SubjectRepository {

    private final Map<String, Subject> store = new HashMap<>();
    private static int idCounter = 3000;

    @Override
    public void save(Subject subject) {
        if (subject.getSubjectId() == null) {
            subject = new Subject(
                    "SUB" + (idCounter++),
                    subject.getName(),
                    subject.getCode(),
                    subject.getType(),
                    subject.getCredits(),
                    subject.getBranch(),
                    subject.getSemester()
            );
        }
        store.put(subject.getSubjectId(), subject);
    }

    @Override
    public void update(Subject subject) {
        store.put(subject.getSubjectId(), subject);
    }

    @Override
    public Subject findBySubjectId(String subjectId) {
        return store.get(subjectId);
    }

    @Override
    public Subject findByCode(String code) {
        return store.values().stream()
                .filter(s -> code.equals(s.getCode()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Subject> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<Subject> findByBranch(String branch) {
        return store.values().stream()
                .filter(s -> branch.equals(s.getBranch()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Subject> findByBranchAndSemester(String branch, int semester) {
        return store.values().stream()
                .filter(s -> branch.equals(s.getBranch()) && s.getSemester() == semester)
                .collect(Collectors.toList());
    }

    @Override
    public List<Subject> findByTeacher(String teacherId) {
        return store.values().stream()
                .filter(s -> teacherId.equals(s.getTeacherId()))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String subjectId) {
        store.remove(subjectId);
    }

    @Override
    public boolean exists(String subjectId) {
        return store.containsKey(subjectId);
    }
}

package com.ams.backend.repository.mock;

import com.ams.backend.entities.Marks;
import com.ams.backend.repository.MarksRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository("mockMarksRepository")
public class MockMarksRepository implements MarksRepository {

    private final Map<String, Marks> store = new HashMap<>();

    @Override
    public void save(Marks marks) {
        store.put(marks.getMarksId(), marks);
    }

    @Override
    public void update(Marks marks) {
        store.put(marks.getMarksId(), marks);
    }

    @Override
    public Marks findByMarksId(String marksId) {
        return store.get(marksId);
    }

    @Override
    public Marks findByStudentAndSubject(String studentId, String subjectId) {
        return store.values().stream()
                .filter(m -> m.getStudentId().equals(studentId)
                        && m.getSubjectId().equals(subjectId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Marks> findByStudent(String studentId) {
        List<Marks> list = new ArrayList<>();
        for (Marks m : store.values()) {
            if (m.getStudentId().equals(studentId)) list.add(m);
        }
        return list;
    }

    @Override
    public List<Marks> findBySubject(String subjectId) {
        List<Marks> list = new ArrayList<>();
        for (Marks m : store.values()) {
            if (m.getSubjectId().equals(subjectId)) list.add(m);
        }
        return list;
    }

    @Override
    public List<Marks> findByGrade(String grade) {
        List<Marks> list = new ArrayList<>();
        for (Marks m : store.values()) {
            if (m.getGrade().equals(grade)) list.add(m);
        }
        return list;
    }

    @Override
    public void delete(String marksId) {
        store.remove(marksId);
    }

    @Override
    public boolean exists(String marksId) {
        return store.containsKey(marksId);
    }
}

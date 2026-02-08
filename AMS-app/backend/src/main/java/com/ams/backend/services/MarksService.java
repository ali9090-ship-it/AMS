package com.ams.backend.services;

import com.ams.backend.entities.Marks;
import com.ams.backend.repository.MarksRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarksService {

    private final MarksRepository marksRepository;

    public MarksService(
            @Qualifier("firebaseMarksRepository")
            MarksRepository marksRepository
    ) {
        this.marksRepository = marksRepository;
    }

    // Create marks record
    public void createMarksRecord(String studentId, String subjectId) {
        Marks marks = new Marks(null, studentId, subjectId);
        marksRepository.save(marks);
    }

    // Set marks
    public void setMarks(String studentId, String subjectId,
                         int internalMarks, int externalMarks) {

        Marks marks = marksRepository.findByStudentAndSubject(studentId, subjectId);

        if (marks == null) {
            System.out.println("❌ Marks record not found");
            return;
        }

        marks.setMarks(internalMarks, externalMarks);
        marksRepository.update(marks);
    }

    public Marks getMarks(String studentId, String subjectId) {
        return marksRepository.findByStudentAndSubject(studentId, subjectId);
    }

    public List<Marks> getStudentMarks(String studentId) {
        return marksRepository.findByStudent(studentId);
    }

    public List<Marks> getSubjectMarks(String subjectId) {
        return marksRepository.findBySubject(subjectId);
    }

    // Calculate CGPA
    public double calculateCGPA(String studentId) {
        List<Marks> marksList = marksRepository.findByStudent(studentId);

        if (marksList.isEmpty()) {
            return 0.0;
        }

        double total = 0;
        for (Marks m : marksList) {
            total += m.getTotalMarks();
        }

        double cgpa = total / marksList.size();
        return Math.round(cgpa * 100.0) / 100.0;
    }

    public List<Marks> getFailedSubjects(String studentId) {
        return marksRepository.findByStudent(studentId)
                .stream()
                .filter(m -> "Fail".equals(m.getStatus()))
                .collect(Collectors.toList());
    }
}

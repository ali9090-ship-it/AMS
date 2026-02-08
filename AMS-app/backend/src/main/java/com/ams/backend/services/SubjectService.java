package com.ams.backend.services;

import com.ams.backend.entities.Subject;
import com.ams.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(
            @Qualifier("firebaseSubjectRepository")
            SubjectRepository subjectRepository
    ) {
        this.subjectRepository = subjectRepository;
    }

    public void createSubject(String name, String code, String type,
                              int credits, String branch, int semester) {

        if (subjectRepository.findByCode(code) != null) {
            System.out.println("❌ Subject with code already exists: " + code);
            return;
        }

        Subject subject = new Subject(
                null,
                name,
                code,
                type,
                credits,
                branch,
                semester
        );

        subjectRepository.save(subject);
        System.out.println("✅ Subject created: " + name + " (" + code + ")");
    }

    public Subject getSubjectById(String subjectId) {
        return subjectRepository.findBySubjectId(subjectId);
    }

    public Subject getSubjectByCode(String code) {
        return subjectRepository.findByCode(code);
    }

    public List<Subject> getSubjectsByBranch(String branch) {
        return subjectRepository.findByBranch(branch);
    }

    public List<Subject> getSubjectsBySemester(int semester, String branch) {
        return subjectRepository.findByBranchAndSemester(branch, semester);
    }

    public List<Subject> getSubjectsByTeacher(String teacherId) {
        return subjectRepository.findByTeacher(teacherId);
    }

    public void assignTeacher(String subjectId, String teacherId) {
        Subject subject = subjectRepository.findBySubjectId(subjectId);

        if (subject == null) {
            System.out.println("❌ Subject not found");
            return;
        }

        subject.setTeacherId(teacherId);
        subjectRepository.update(subject);
        System.out.println("✅ Teacher assigned to subject: " + subjectId);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public void printSubjectInfo(String subjectId) {
        Subject subject = subjectRepository.findBySubjectId(subjectId);

        if (subject == null) {
            System.out.println("❌ Subject not found");
            return;
        }

        System.out.println("\nSUBJECT INFORMATION");
        System.out.println("─".repeat(40));
        System.out.println("Name: " + subject.getName());
        System.out.println("Code: " + subject.getCode());
        System.out.println("Type: " + subject.getType());
        System.out.println("Credits: " + subject.getCredits());
        System.out.println("Branch: " + subject.getBranch());
        System.out.println("Semester: " + subject.getSemester());
        System.out.println("Teacher ID: " + subject.getTeacherId());
        System.out.println("─".repeat(40));
    }
}

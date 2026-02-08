package com.ams.backend.services;

import com.ams.backend.entities.Student;
import com.ams.backend.repository.StudentRepository;
import com.ams.backend.utils.EmailValidator;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(
            @Qualifier("firebaseStudentRepository")
            StudentRepository studentRepository
    ) {
        this.studentRepository = studentRepository;
    }

    // REGISTER
    public boolean registerStudent(String uid, String name, String email,
                                   String rollNo, String branch, int semester) {

        if (!EmailValidator.isValidStudent(email)) {
            System.out.println("❌ Invalid student email format: " + email);
            return false;
        }

        if (studentRepository.findByUid(uid) != null) {
            System.out.println("❌ Student with this UID already exists");
            return false;
        }

        if (semester < 1 || semester > 8) {
            System.out.println("❌ Invalid semester: " + semester);
            return false;
        }

        Student student = new Student(
                uid,   // studentId
                uid,   // uid
                name,
                email,
                rollNo,
                branch,
                semester
        );

        studentRepository.save(student);
        System.out.println("✅ Student registered successfully: " + name);
        return true;
    }

    // GET BY ID
    public Student getStudentProfile(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    // GET BY EMAIL
    public Student getStudentByEmail(String email) {
        if (!EmailValidator.isDomainValid(email)) return null;
        return studentRepository.findByEmail(email);
    }

    // FILTERS
    public List<Student> getStudentsByBranch(String branch) {
        return studentRepository.findByBranch(branch);
    }

    public List<Student> getStudentsBySemester(int semester) {
        if (semester < 1 || semester > 8) return List.of();
        return studentRepository.findBySemester(semester);
    }

    public List<Student> getStudentsByBranchAndSemester(String branch, int semester) {
        return studentRepository.findByBranchAndSemester(branch, semester);
    }

    // UPDATE
    public boolean updateStudentInfo(String studentId, String name, int semester) {
        Student student = studentRepository.findByStudentId(studentId);
        if (student == null) return false;

        student.setName(name);
        student.setSemester(semester);
        studentRepository.update(student);
        return true;
    }

    // DELETE
    public boolean deleteStudent(String studentId) {
        if (!studentRepository.exists(studentId)) return false;
        studentRepository.delete(studentId);
        return true;
    }

    // COUNT
    public int getTotalStudents() {
        return studentRepository.findAll().size();
    }
}

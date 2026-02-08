package com.ams.backend.services;

import com.ams.backend.entities.Student;
import com.ams.backend.entities.Teacher;
import com.ams.backend.repository.StudentRepository;
import com.ams.backend.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public AuthService(
            @Qualifier("firebaseStudentRepository")
            StudentRepository studentRepository,

            @Qualifier("firebaseTeacherRepository")
            TeacherRepository teacherRepository
    ) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    public String getRoleByUid(String uid) {

        Student student = studentRepository.findByUid(uid);
        if (student != null) {
            return "STUDENT";
        }

        Teacher teacher = teacherRepository.findByUid(uid);
        if (teacher != null) {
            return "TEACHER";
        }

        return "ADMIN"; // future
    }
}

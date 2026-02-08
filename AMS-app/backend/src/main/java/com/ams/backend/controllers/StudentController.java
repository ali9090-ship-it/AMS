package com.ams.backend.controllers;

import com.ams.backend.entities.Student;
import com.ams.backend.services.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/register")
    public boolean register(@RequestBody Student student) {
        return studentService.registerStudent(
                student.getUid(),
                student.getName(),
                student.getEmail(),
                student.getRollNo(),
                student.getBranch(),
                student.getSemester()
        );
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable String id) {
        return studentService.getStudentProfile(id);
    }

    @GetMapping("/branch/{branch}")
    public List<Student> getByBranch(@PathVariable String branch) {
        return studentService.getStudentsByBranch(branch);
    }
}

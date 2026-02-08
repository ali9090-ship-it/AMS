package com.ams.backend.controllers;

import com.ams.backend.entities.Subject;
import com.ams.backend.services.SubjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping("/create")
    public void createSubject(@RequestParam String name,
                              @RequestParam String code,
                              @RequestParam String type,
                              @RequestParam int credits,
                              @RequestParam String branch,
                              @RequestParam int semester) {
        subjectService.createSubject(name, code, type, credits, branch, semester);
    }

    @GetMapping("/{subjectId}")
    public Subject getById(@PathVariable String subjectId) {
        return subjectService.getSubjectById(subjectId);
    }

    @GetMapping("/code/{code}")
    public Subject getByCode(@PathVariable String code) {
        return subjectService.getSubjectByCode(code);
    }

    @GetMapping("/branch/{branch}")
    public List<Subject> getByBranch(@PathVariable String branch) {
        return subjectService.getSubjectsByBranch(branch);
    }

    @GetMapping("/branch/{branch}/semester/{semester}")
    public List<Subject> getByBranchAndSemester(@PathVariable String branch,
                                                @PathVariable int semester) {
        return subjectService.getSubjectsBySemester(semester, branch);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Subject> getByTeacher(@PathVariable String teacherId) {
        return subjectService.getSubjectsByTeacher(teacherId);
    }

    @PostMapping("/assign-teacher")
    public void assignTeacher(@RequestParam String subjectId,
                              @RequestParam String teacherId) {
        subjectService.assignTeacher(subjectId, teacherId);
    }

    @GetMapping("/all")
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    @GetMapping("/info/{subjectId}")
    public void printInfo(@PathVariable String subjectId) {
        subjectService.printSubjectInfo(subjectId);
    }
}

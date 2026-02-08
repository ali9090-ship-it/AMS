package com.ams.backend.controllers;

import com.ams.backend.entities.Marks;
import com.ams.backend.services.MarksService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) {
        this.marksService = marksService;
    }

    @PostMapping("/create")
    public void create(@RequestParam String studentId,
                       @RequestParam String subjectId) {
        marksService.createMarksRecord(studentId, subjectId);
    }

    @PostMapping("/set")
    public void setMarks(@RequestParam String studentId,
                         @RequestParam String subjectId,
                         @RequestParam int internalMarks,
                         @RequestParam int externalMarks) {
        marksService.setMarks(studentId, subjectId, internalMarks, externalMarks);
    }

    @GetMapping("/get")
    public Marks getMarks(@RequestParam String studentId,
                          @RequestParam String subjectId) {
        return marksService.getMarks(studentId, subjectId);
    }

    @GetMapping("/student/{studentId}")
    public List<Marks> getStudentMarks(@PathVariable String studentId) {
        return marksService.getStudentMarks(studentId);
    }

    @GetMapping("/subject/{subjectId}")
    public List<Marks> getSubjectMarks(@PathVariable String subjectId) {
        return marksService.getSubjectMarks(subjectId);
    }

    @GetMapping("/cgpa/{studentId}")
    public double getCGPA(@PathVariable String studentId) {
        return marksService.calculateCGPA(studentId);
    }

    @GetMapping("/failed/{studentId}")
    public List<Marks> getFailedSubjects(@PathVariable String studentId) {
        return marksService.getFailedSubjects(studentId);
    }
}

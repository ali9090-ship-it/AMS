package com.ams.backend.controllers;

import com.ams.backend.entities.Attendance;
import com.ams.backend.services.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public String create(@RequestParam String studentId,
                         @RequestParam String subjectId) {
        service.createAttendanceRecord(studentId, subjectId);
        return "Created attendance for " + studentId + " " + subjectId;
    }

    @PostMapping("/present")
    public String present(@RequestParam String studentId,
                          @RequestParam String subjectId) {
        service.markPresent(studentId, subjectId);
        return "Marked PRESENT";
    }

    @PostMapping("/absent")
    public String absent(@RequestParam String studentId,
                         @RequestParam String subjectId) {
        service.markAbsent(studentId, subjectId);
        return "Marked ABSENT";
    }

    @GetMapping("/percentage")
    public double percentage(@RequestParam String studentId,
                             @RequestParam String subjectId) {
        return service.getAttendancePercentage(studentId, subjectId);
    }

    @GetMapping("/status")
    public String status(@RequestParam String studentId,
                         @RequestParam String subjectId) {
        return service.getAttendanceStatus(studentId, subjectId);
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> student(@PathVariable String studentId) {
        return service.getStudentAttendance(studentId);
    }

    @GetMapping("/subject/{subjectId}")
    public List<Attendance> subject(@PathVariable String subjectId) {
        return service.getSubjectAttendance(subjectId);
    }
}

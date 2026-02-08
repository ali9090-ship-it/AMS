package com.ams.backend.controllers;

import com.ams.backend.dto.DashboardResponse;
import com.ams.backend.services.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/student/{studentId}")
    public DashboardResponse getStudentDashboard(@PathVariable String studentId) {
        return dashboardService.getStudentDashboard(studentId);
    }
}

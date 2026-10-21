package com.bizflow.controller;

import com.bizflow.dto.DashboardStatsDto;
import com.bizflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for summary overview dashboard metrics")
public class DashboardController {

    private final ReportService reportService;

    public DashboardController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated dashboard statistics")
    public DashboardStatsDto getStats() {
        return reportService.getDashboardStats();
    }
}

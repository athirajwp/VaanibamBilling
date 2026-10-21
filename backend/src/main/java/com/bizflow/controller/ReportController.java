package com.bizflow.controller;

import com.bizflow.dto.*;
import com.bizflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Analytics", description = "Endpoints for sales summary, daily charts, top products, GST summaries, and customer ledgers")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales-summary")
    @Operation(summary = "Get sales, purchases, profit, and order totals within a date range")
    public SalesSummaryDto getSalesSummary(@RequestParam(value = "from", required = false) String from,
                                           @RequestParam(value = "to", required = false) String to) {
        return reportService.getSalesSummary(from, to);
    }

    @GetMapping("/daily-series")
    @Operation(summary = "Get daily time-series data for sales, purchases, and profit charts")
    public List<DailySeriesDto> getDailySeries(@RequestParam(value = "from", required = false) String from,
                                               @RequestParam(value = "to", required = false) String to) {
        return reportService.getDailySeries(from, to);
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products by revenue and units sold")
    public List<TopProductDto> getTopProducts(@RequestParam(value = "from", required = false) String from,
                                              @RequestParam(value = "to", required = false) String to,
                                              @RequestParam(value = "limit", defaultValue = "6") int limit) {
        return reportService.getTopProducts(from, to, limit);
    }

    @GetMapping("/gst-summary")
    @Operation(summary = "Get GST report including outward and inward tax calculations")
    public GstSummaryDto getGstSummary(@RequestParam(value = "from", required = false) String from,
                                       @RequestParam(value = "to", required = false) String to) {
        return reportService.getGstSummary(from, to);
    }

    @GetMapping("/customers")
    @Operation(summary = "Get customer sales, payments, and outstanding report")
    public List<CustomerReportDto> getCustomerReports(@RequestParam(value = "from", required = false) String from,
                                                      @RequestParam(value = "to", required = false) String to) {
        return reportService.getCustomerReports(from, to);
    }
}

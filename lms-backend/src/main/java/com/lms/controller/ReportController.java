package com.lms.controller;

import com.lms.dto.DashboardStats;
import com.lms.dto.LoanResponse;
import com.lms.service.LoanService;
import com.lms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
public class ReportController {

    private final ReportService reportService;
    private final LoanService loanService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<LoanResponse>> getOverdueReport() {
        return ResponseEntity.ok(loanService.getOverdueLoans());
    }
}

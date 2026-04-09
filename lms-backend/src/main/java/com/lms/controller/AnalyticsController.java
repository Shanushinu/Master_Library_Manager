package com.lms.controller;

import com.lms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/top-books")
    public ResponseEntity<List<Map<String, Object>>> getTopBooks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopBooks(limit));
    }

    @GetMapping("/active-members")
    public ResponseEntity<List<Map<String, Object>>> getActiveMembers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getActiveMembers(limit));
    }

    @GetMapping("/genre-stats")
    public ResponseEntity<List<Map<String, Object>>> getGenreStats() {
        return ResponseEntity.ok(analyticsService.getGenreStats());
    }

    @GetMapping("/monthly-loans")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyLoans(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year) {
        return ResponseEntity.ok(analyticsService.getMonthlyLoans(year));
    }
}

package com.lms.dto;

import java.util.List;
import java.util.Map;

public record DashboardStats(
    long totalBooks,
    long availableBooks,
    long totalUsers,
    long activeLoans,
    long overdueLoans,
    long pendingReservations,
    List<Map<String, Object>> categoryStats,
    List<Map<String, Object>> recentActivity
) {}

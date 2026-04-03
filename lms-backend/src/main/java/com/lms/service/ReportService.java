package com.lms.service;

import com.lms.dto.DashboardStats;
import com.lms.model.enums.MainCategory;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardStats getDashboardStats() {
        long totalBooks = bookRepository.countByDeletedFalse();
        long availableBooks = bookRepository.countByAvailableCopiesGreaterThanAndDeletedFalse(0);
        long totalUsers = userRepository.count();
        long activeLoans = loanRepository.countByUserIdAndReturnedDateIsNull(0L) +
            loanRepository.findOverdueLoans().size() +
            loanRepository.count() - loanRepository.findOverdueLoans().size();
        // Simpler count approach
        activeLoans = loanRepository.findAll().stream()
            .filter(l -> l.getReturnedDate() == null).count();
        long overdueLoans = loanRepository.countOverdueLoans();
        long pendingReservations = reservationRepository.findAll().stream()
            .filter(r -> r.getStatus().name().equals("PENDING")).count();

        List<Object[]> rawStats = bookRepository.getCirculationStatsByCategory();
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        for (Object[] row : rawStats) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("category", ((MainCategory) row[0]).getDisplayName());
            stat.put("categoryKey", ((MainCategory) row[0]).name());
            stat.put("loans", row[1]);
            categoryStats.add(stat);
        }

        List<Map<String, Object>> recentActivity = auditLogRepository.findTop20ByOrderByTimestampDesc()
            .stream().map(log -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", log.getId());
                activity.put("action", log.getAction());
                activity.put("entityType", log.getEntityType());
                activity.put("description", log.getDescription());
                activity.put("timestamp", log.getTimestamp());
                return activity;
            }).toList();

        return new DashboardStats(totalBooks, availableBooks, totalUsers, activeLoans,
            overdueLoans, pendingReservations, categoryStats, recentActivity);
    }
}

package com.lms.service;

import com.lms.repository.BookRepository;
import com.lms.repository.LoanRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getTopBooks(int limit) {
        List<Object[]> results = loanRepository.findTopBorrowedBooks(PageRequest.of(0, limit));
        List<Map<String, Object>> topBooks = new ArrayList<>();
        for (Object[] row : results) {
            Long bookId = (Long) row[0];
            Long count = (Long) row[1];
            bookRepository.findById(bookId).ifPresent(book -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("bookId", book.getId());
                entry.put("title", book.getTitle());
                entry.put("author", book.getAuthor());
                entry.put("loanCount", count);
                topBooks.add(entry);
            });
        }
        return topBooks;
    }

    public List<Map<String, Object>> getActiveMembers(int limit) {
        List<Object[]> results = loanRepository.findMostActiveMembers(PageRequest.of(0, limit));
        List<Map<String, Object>> activeMembers = new ArrayList<>();
        for (Object[] row : results) {
            Long userId = (Long) row[0];
            Long count = (Long) row[1];
            userRepository.findById(userId).ifPresent(user -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("userId", user.getId());
                entry.put("name", user.getName());
                entry.put("email", user.getEmail());
                entry.put("booksRead", count);
                activeMembers.add(entry);
            });
        }
        return activeMembers;
    }

    public List<Map<String, Object>> getGenreStats() {
        List<Object[]> results = loanRepository.getGenreStats();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("genre", row[0]);
            entry.put("loanCount", row[1]);
            stats.add(entry);
        }
        return stats;
    }

    public List<Map<String, Object>> getMonthlyLoans(int year) {
        List<Object[]> results = loanRepository.getMonthlyLoanStats(year);
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", row[0]);
            entry.put("loanCount", row[1]);
            stats.add(entry);
        }
        return stats;
    }
}

package com.lms.controller;

import com.lms.dto.DashboardStats;
import com.lms.dto.LoanResponse;
import com.lms.model.Fine;
import com.lms.model.Loan;
import com.lms.service.LoanService;
import com.lms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> getOverdueReport(@RequestParam(required = false) String format) {
        List<Loan> loans = reportService.getOverdueLoansReport();
        if ("csv".equalsIgnoreCase(format)) {
            return buildCsvResponse("overdue_loans", loanHeaders(), loansToRows(loans));
        }
        if ("pdf".equalsIgnoreCase(format)) {
            return buildPdfResponse("Overdue Loans Report", "overdue_loans", loanHeaders(), loansToRows(loans));
        }
        return ResponseEntity.ok(loans.stream().map(LoanResponse::from).toList());
    }

    @GetMapping("/loans")
    public ResponseEntity<?> getLoanReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String format) {
        List<Loan> loans = reportService.getLoansInRange(from, to);
        if ("csv".equalsIgnoreCase(format)) {
            return buildCsvResponse("loans_report", loanHeaders(), loansToRows(loans));
        }
        if ("pdf".equalsIgnoreCase(format)) {
            return buildPdfResponse("Loans Report (" + from + " to " + to + ")", "loans_report", loanHeaders(), loansToRows(loans));
        }
        return ResponseEntity.ok(loans.stream().map(LoanResponse::from).toList());
    }

    @GetMapping("/fines")
    public ResponseEntity<?> getFinesReport(@RequestParam(required = false) String format) {
        List<Fine> fines = reportService.getUnpaidFinesReport();
        String[] headers = {"Fine ID", "Loan ID", "User", "Amount", "Reason", "Created"};
        List<String[]> rows = fines.stream().map(f -> new String[]{
            f.getId().toString(),
            f.getLoan().getId().toString(),
            f.getLoan().getUser().getName(),
            f.getAmount().toString(),
            f.getReason() != null ? f.getReason() : "",
            f.getCreatedAt() != null ? f.getCreatedAt().toString() : ""
        }).toList();

        if ("csv".equalsIgnoreCase(format)) {
            return buildCsvResponse("unpaid_fines", headers, rows);
        }
        if ("pdf".equalsIgnoreCase(format)) {
            return buildPdfResponse("Unpaid Fines Report", "unpaid_fines", headers, rows);
        }
        return ResponseEntity.ok(fines.stream().map(f -> Map.of(
            "id", f.getId(), "loanId", f.getLoan().getId(),
            "user", f.getLoan().getUser().getName(), "amount", f.getAmount(),
            "reason", f.getReason() != null ? f.getReason() : "", "isPaid", f.isPaid()
        )).toList());
    }

    @GetMapping("/members")
    public ResponseEntity<?> getMembersReport(@RequestParam(required = false) String format) {
        List<Map<String, Object>> members = reportService.getMemberReport();
        String[] headers = {"ID", "Name", "Email", "Role", "Loan Count"};
        List<String[]> rows = members.stream().map(m -> new String[]{
            m.get("id").toString(), m.get("name").toString(),
            m.get("email").toString(), m.get("role").toString(),
            m.get("loanCount").toString()
        }).toList();

        if ("csv".equalsIgnoreCase(format)) {
            return buildCsvResponse("members_report", headers, rows);
        }
        if ("pdf".equalsIgnoreCase(format)) {
            return buildPdfResponse("Members Report", "members_report", headers, rows);
        }
        return ResponseEntity.ok(members);
    }

    // === Helper methods ===

    private String[] loanHeaders() {
        return new String[]{"Loan ID", "Book", "User", "Checkout", "Due", "Returned", "Status", "Fine"};
    }

    private List<String[]> loansToRows(List<Loan> loans) {
        return loans.stream().map(l -> new String[]{
            l.getId().toString(),
            l.getBook().getTitle(),
            l.getUser().getName(),
            l.getCheckoutDate().toString(),
            l.getDueDate().toString(),
            l.getReturnedDate() != null ? l.getReturnedDate().toString() : "N/A",
            l.getStatus().name(),
            l.getFineAmount().toString()
        }).toList();
    }

    private ResponseEntity<byte[]> buildCsvResponse(String filename, String[] headers, List<String[]> rows) {
        byte[] csv = reportService.generateCsv(headers, rows);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    private ResponseEntity<byte[]> buildPdfResponse(String title, String filename, String[] headers, List<String[]> rows) {
        byte[] pdf = reportService.generatePdf(title, headers, rows);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}

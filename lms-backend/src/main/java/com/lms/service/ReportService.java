package com.lms.service;

import com.lms.dto.DashboardStats;
import com.lms.model.Fine;
import com.lms.model.Loan;
import com.lms.model.User;
import com.lms.model.enums.MainCategory;
import com.lms.repository.*;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
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
    private final FineRepository fineRepository;

    public DashboardStats getDashboardStats() {
        long totalBooks = bookRepository.countByDeletedFalse();
        long availableBooks = bookRepository.countByAvailableCopiesGreaterThanAndDeletedFalse(0);
        long totalUsers = userRepository.count();
        long activeLoans = loanRepository.findAll().stream()
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

    // ===== Loan Report =====
    public List<Loan> getLoansInRange(LocalDate from, LocalDate to) {
        return loanRepository.findByCheckoutDateBetween(from, to);
    }

    public List<Loan> getOverdueLoansReport() {
        return loanRepository.findOverdueLoans();
    }

    public List<Fine> getUnpaidFinesReport() {
        return fineRepository.findAllUnpaid();
    }

    public List<Map<String, Object>> getMemberReport() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", user.getId());
            entry.put("name", user.getName());
            entry.put("email", user.getEmail());
            entry.put("role", user.getRole().name());
            entry.put("loanCount", loanRepository.findByUserId(user.getId()).size());
            report.add(entry);
        }
        return report;
    }

    // ===== CSV Generation =====
    public byte[] generateCsv(String[] headers, List<String[]> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", headers)).append("\n");
        for (String[] row : rows) {
            sb.append(String.join(",", row)).append("\n");
        }
        return sb.toString().getBytes();
    }

    // ===== Excel (POI) Generation =====
    public byte[] generateExcel(String sheetName, String[] headers, List<String[]> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(sheetName);

            // Header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            for (int i = 0; i < rows.size(); i++) {
                Row row = sheet.createRow(i + 1);
                String[] data = rows.get(i);
                for (int j = 0; j < data.length; j++) {
                    row.createCell(j).setCellValue(data[j] != null ? data[j] : "");
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    // ===== PDF (iText) Generation =====
    public byte[] generatePdf(String title, String[] headers, List<String[]> rows) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph titleParagraph = new Paragraph(title, titleFont);
            titleParagraph.setAlignment(Element.ALIGN_CENTER);
            titleParagraph.setSpacingAfter(20);
            document.add(titleParagraph);

            // Date
            com.itextpdf.text.Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph dateParagraph = new Paragraph("Generated: " + LocalDate.now(), dateFont);
            dateParagraph.setAlignment(Element.ALIGN_RIGHT);
            dateParagraph.setSpacingAfter(10);
            document.add(dateParagraph);

            // Table
            PdfPTable table = new PdfPTable(headers.length);
            table.setWidthPercentage(100);

            // Header
            com.itextpdf.text.Font headerF = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerF));
                cell.setBackgroundColor(new BaseColor(44, 62, 80));
                cell.setPadding(5);
                table.addCell(cell);
            }

            // Data
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            boolean alternate = false;
            for (String[] row : rows) {
                for (String value : row) {
                    PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "", dataFont));
                    if (alternate) {
                        cell.setBackgroundColor(new BaseColor(245, 245, 245));
                    }
                    cell.setPadding(4);
                    table.addCell(cell);
                }
                alternate = !alternate;
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}

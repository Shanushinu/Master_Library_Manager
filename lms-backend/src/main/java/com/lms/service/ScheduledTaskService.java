package com.lms.service;

import com.lms.model.Loan;
import com.lms.model.enums.LoanStatus;
import com.lms.model.enums.NotificationType;
import com.lms.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final LoanRepository loanRepository;
    private final FineService fineService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.fine.rate-per-day:2.00}")
    private BigDecimal fineRatePerDay;

    @Value("${app.notification.due-reminder-days:2}")
    private int dueReminderDays;

    /**
     * Runs daily at midnight: marks overdue loans and calculates fines.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processOverdueLoans() {
        log.info("Running scheduled task: processOverdueLoans");

        List<Loan> overdueLoans = loanRepository.findOverdueLoans();
        int count = 0;

        for (Loan loan : overdueLoans) {
            if (loan.getStatus() != LoanStatus.OVERDUE) {
                loan.setStatus(LoanStatus.OVERDUE);
                loanRepository.save(loan);
            }

            // Calculate daily fine
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDate.now());
            BigDecimal totalFine = fineRatePerDay.multiply(BigDecimal.valueOf(daysOverdue));
            loan.setFineAmount(totalFine);
            loanRepository.save(loan);

            // Create fine record if not already today
            fineService.createFine(loan, fineRatePerDay, "Daily overdue fine - Day " + daysOverdue);

            // Send overdue notification
            notificationService.createNotification(
                loan.getUser().getId(),
                "Overdue Book Alert",
                "Your book '" + loan.getBook().getTitle() + "' is overdue. Fine: ₹" + totalFine,
                NotificationType.OVERDUE
            );

            // Send email
            emailService.sendOverdueAlert(
                loan.getUser().getEmail(),
                loan.getUser().getName(),
                loan.getBook().getTitle(),
                loan.getDueDate().toString()
            );

            count++;
        }

        log.info("Processed {} overdue loans", count);
    }

    /**
     * Runs daily at 8 AM: sends due reminders for books due in 2 days.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendDueReminders() {
        log.info("Running scheduled task: sendDueReminders");

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(dueReminderDays);

        List<Loan> soonDueLoans = loanRepository.findAllLoansDueSoon(start, end);
        int count = 0;

        for (Loan loan : soonDueLoans) {
            notificationService.createNotification(
                loan.getUser().getId(),
                "Due Date Reminder",
                "Your book '" + loan.getBook().getTitle() + "' is due on " + loan.getDueDate(),
                NotificationType.DUE_REMINDER
            );

            emailService.sendDueReminder(
                loan.getUser().getEmail(),
                loan.getUser().getName(),
                loan.getBook().getTitle(),
                loan.getDueDate().toString()
            );

            count++;
        }

        log.info("Sent {} due reminders", count);
    }
}

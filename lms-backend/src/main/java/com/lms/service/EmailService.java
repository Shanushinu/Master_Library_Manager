package com.lms.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@library.com}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendDueReminder(String to, String userName, String bookTitle, String dueDate) {
        String subject = "Library Due Date Reminder - " + bookTitle;
        String body = String.format(
            "Dear %s,\n\n" +
            "This is a reminder that the following book is due on %s:\n\n" +
            "📚 %s\n\n" +
            "Please return or renew the book before the due date to avoid fines (₹2/day).\n\n" +
            "Best regards,\nLibrary Management System",
            userName, dueDate, bookTitle
        );
        sendEmail(to, subject, body);
    }

    public void sendOverdueAlert(String to, String userName, String bookTitle, String dueDate) {
        String subject = "⚠️ Overdue Book Alert - " + bookTitle;
        String body = String.format(
            "Dear %s,\n\n" +
            "The following book is OVERDUE (was due on %s):\n\n" +
            "📚 %s\n\n" +
            "A fine of ₹2/day is being charged. Please return the book immediately.\n\n" +
            "Best regards,\nLibrary Management System",
            userName, dueDate, bookTitle
        );
        sendEmail(to, subject, body);
    }

    public void sendReservationReady(String to, String userName, String bookTitle) {
        String subject = "✅ Your Reserved Book is Ready - " + bookTitle;
        String body = String.format(
            "Dear %s,\n\n" +
            "Great news! Your reserved book is now available for pickup:\n\n" +
            "📚 %s\n\n" +
            "Please collect it within 3 days, or the reservation will expire.\n\n" +
            "Best regards,\nLibrary Management System",
            userName, bookTitle
        );
        sendEmail(to, subject, body);
    }
}

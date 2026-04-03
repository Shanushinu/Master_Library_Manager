package com.lms.dto;

import com.lms.model.Loan;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoanResponse(
    Long id,
    Long bookId,
    String bookTitle,
    String bookAuthor,
    Long userId,
    String userName,
    LocalDate checkoutDate,
    LocalDate dueDate,
    LocalDate returnedDate,
    BigDecimal fineAmount,
    boolean finePaid,
    int renewedCount,
    String status
) {
    public static LoanResponse from(Loan loan) {
        return new LoanResponse(
            loan.getId(),
            loan.getBook().getId(),
            loan.getBook().getTitle(),
            loan.getBook().getAuthor(),
            loan.getUser().getId(),
            loan.getUser().getName(),
            loan.getCheckoutDate(),
            loan.getDueDate(),
            loan.getReturnedDate(),
            loan.getFineAmount(),
            loan.isFinePaid(),
            loan.getRenewedCount(),
            loan.getStatus().name()
        );
    }
}

package com.lms.dto;

import com.lms.model.Fine;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FineResponse(
    Long id,
    Long loanId,
    BigDecimal amount,
    String reason,
    boolean isPaid,
    LocalDateTime paidAt,
    LocalDateTime createdAt
) {
    public static FineResponse from(Fine fine) {
        return new FineResponse(
            fine.getId(),
            fine.getLoan().getId(),
            fine.getAmount(),
            fine.getReason(),
            fine.isPaid(),
            fine.getPaidAt(),
            fine.getCreatedAt()
        );
    }
}

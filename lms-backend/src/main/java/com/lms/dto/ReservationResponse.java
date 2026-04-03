package com.lms.dto;

import com.lms.model.Reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponse(
    Long id,
    Long bookId,
    String bookTitle,
    String bookAuthor,
    Long userId,
    String userName,
    String status,
    LocalDate expiryDate,
    int queuePosition,
    LocalDateTime createdAt
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
            reservation.getId(),
            reservation.getBook().getId(),
            reservation.getBook().getTitle(),
            reservation.getBook().getAuthor(),
            reservation.getUser().getId(),
            reservation.getUser().getName(),
            reservation.getStatus().name(),
            reservation.getExpiryDate(),
            reservation.getQueuePosition(),
            reservation.getCreatedAt()
        );
    }
}

package com.lms.dto;

import com.lms.model.SeatBooking;

import java.time.LocalDate;
import java.time.LocalTime;

public record SeatBookingResponse(
    Long id,
    Long userId,
    String userName,
    Long roomId,
    String roomName,
    Integer seatNumber,
    LocalDate bookingDate,
    LocalTime startTime,
    LocalTime endTime,
    String status
) {
    public static SeatBookingResponse from(SeatBooking booking) {
        return new SeatBookingResponse(
            booking.getId(),
            booking.getUser().getId(),
            booking.getUser().getName(),
            booking.getRoom().getId(),
            booking.getRoom().getName(),
            booking.getSeatNumber(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getStatus().name()
        );
    }
}

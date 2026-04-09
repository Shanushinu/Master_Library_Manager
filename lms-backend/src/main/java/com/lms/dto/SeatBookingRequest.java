package com.lms.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record SeatBookingRequest(
    @NotNull Long roomId,
    @NotNull Integer seatNumber,
    @NotNull LocalDate bookingDate,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime
) {}

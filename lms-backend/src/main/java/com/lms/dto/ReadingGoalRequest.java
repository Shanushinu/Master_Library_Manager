package com.lms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReadingGoalRequest(
    @NotNull Integer year,
    @NotNull @Min(1) Integer targetBooks
) {}

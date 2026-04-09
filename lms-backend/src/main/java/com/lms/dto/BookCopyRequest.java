package com.lms.dto;

import jakarta.validation.constraints.NotNull;

public record BookCopyRequest(
    @NotNull Long bookId,
    @NotNull Integer copyNumber,
    String barcode,
    String condition,
    String shelfLocation,
    String rackNumber
) {}

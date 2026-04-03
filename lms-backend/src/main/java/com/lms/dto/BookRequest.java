package com.lms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookRequest(
    @NotBlank String title,
    @NotBlank String author,
    String isbn,
    @NotNull String mainCategory,
    @NotNull String subCategory,
    Integer publicationYear,
    String publisher,
    String edition,
    @Min(1) int totalCopies,
    String locationShelf,
    String language,
    boolean referenceOnly,
    String description
) {}

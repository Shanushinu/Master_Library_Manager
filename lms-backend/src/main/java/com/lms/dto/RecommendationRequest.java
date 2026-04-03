package com.lms.dto;

import jakarta.validation.constraints.NotBlank;

public record RecommendationRequest(
    @NotBlank String title,
    @NotBlank String author,
    String isbn,
    String reason
) {}

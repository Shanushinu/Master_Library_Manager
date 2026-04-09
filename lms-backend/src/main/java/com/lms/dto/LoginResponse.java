package com.lms.dto;

public record LoginResponse(
    String token,
    String refreshToken,
    String email,
    String name,
    String role,
    Long userId
) {}

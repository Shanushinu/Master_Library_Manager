package com.lms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @Email @NotBlank String email,
    @NotBlank @Size(min = 6) String password,
    @NotBlank String name,
    String phone,
    @NotBlank String role,
    String collegeName,
    String schoolGrade,
    @Email String parentEmail
) {}

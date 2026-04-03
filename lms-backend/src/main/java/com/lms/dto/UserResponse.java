package com.lms.dto;

import com.lms.model.User;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    String name,
    String phone,
    String role,
    String collegeName,
    String schoolGrade,
    boolean enabled,
    LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPhone(),
            user.getRole().name(),
            user.getCollegeName(),
            user.getSchoolGrade(),
            user.isEnabled(),
            user.getCreatedAt()
        );
    }
}

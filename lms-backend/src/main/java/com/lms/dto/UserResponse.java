package com.lms.dto;

import com.lms.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    String name,
    String phone,
    String role,
    String studentId,
    String collegeName,
    String schoolGrade,
    LocalDate membershipExpiry,
    boolean isActive,
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
            user.getStudentId(),
            user.getCollegeName(),
            user.getSchoolGrade(),
            user.getMembershipExpiry(),
            user.isActive(),
            user.isEnabled(),
            user.getCreatedAt()
        );
    }
}

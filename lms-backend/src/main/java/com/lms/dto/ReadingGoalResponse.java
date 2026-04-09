package com.lms.dto;

import com.lms.model.ReadingGoal;

import java.time.LocalDateTime;

public record ReadingGoalResponse(
    Long id,
    Long userId,
    Integer year,
    Integer targetBooks,
    Integer completedBooks,
    String status,
    LocalDateTime createdAt
) {
    public static ReadingGoalResponse from(ReadingGoal goal) {
        return new ReadingGoalResponse(
            goal.getId(),
            goal.getUser().getId(),
            goal.getYear(),
            goal.getTargetBooks(),
            goal.getCompletedBooks(),
            goal.getStatus().name(),
            goal.getCreatedAt()
        );
    }
}

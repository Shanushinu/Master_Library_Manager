package com.lms.dto;

import com.lms.model.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String title,
    String message,
    String type,
    boolean isRead,
    LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
            n.getId(),
            n.getTitle(),
            n.getMessage(),
            n.getType().name(),
            n.isRead(),
            n.getCreatedAt()
        );
    }
}

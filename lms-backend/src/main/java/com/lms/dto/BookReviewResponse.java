package com.lms.dto;

import com.lms.model.BookReview;

import java.time.LocalDateTime;

public record BookReviewResponse(
    Long id,
    Long userId,
    String userName,
    Long bookId,
    String bookTitle,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {
    public static BookReviewResponse from(BookReview review) {
        return new BookReviewResponse(
            review.getId(),
            review.getUser().getId(),
            review.getUser().getName(),
            review.getBook().getId(),
            review.getBook().getTitle(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}

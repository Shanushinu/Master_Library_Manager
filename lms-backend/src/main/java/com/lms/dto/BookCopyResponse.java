package com.lms.dto;

import com.lms.model.BookCopy;

public record BookCopyResponse(
    Long id,
    Long bookId,
    String bookTitle,
    Integer copyNumber,
    String barcode,
    String condition,
    boolean isAvailable,
    String shelfLocation,
    String rackNumber
) {
    public static BookCopyResponse from(BookCopy copy) {
        return new BookCopyResponse(
            copy.getId(),
            copy.getBook().getId(),
            copy.getBook().getTitle(),
            copy.getCopyNumber(),
            copy.getBarcode(),
            copy.getCondition().name(),
            copy.isAvailable(),
            copy.getShelfLocation(),
            copy.getRackNumber()
        );
    }
}

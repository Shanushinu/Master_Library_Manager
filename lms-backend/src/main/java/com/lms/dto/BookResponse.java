package com.lms.dto;

import com.lms.model.Book;

public record BookResponse(
    Long id,
    String title,
    String author,
    String isbn,
    String mainCategory,
    String mainCategoryDisplay,
    String subCategory,
    Integer publicationYear,
    String publisher,
    String edition,
    int totalCopies,
    int availableCopies,
    String locationShelf,
    String language,
    boolean referenceOnly,
    String description
) {
    public static BookResponse from(Book book) {
        return new BookResponse(
            book.getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getIsbn(),
            book.getMainCategory().name(),
            book.getMainCategory().getDisplayName(),
            book.getSubCategory(),
            book.getPublicationYear(),
            book.getPublisher(),
            book.getEdition(),
            book.getTotalCopies(),
            book.getAvailableCopies(),
            book.getLocationShelf(),
            book.getLanguage(),
            book.isReferenceOnly(),
            book.getDescription()
        );
    }
}

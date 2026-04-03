package com.lms.service;

import com.lms.dto.BookRequest;
import com.lms.dto.BookResponse;
import com.lms.exception.InvalidCategoryException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Book;
import com.lms.model.enums.MainCategory;
import com.lms.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public BookResponse createBook(BookRequest request) {
        MainCategory mainCat = parseAndValidateCategory(request.mainCategory(), request.subCategory());
        Book book = Book.builder()
            .title(request.title())
            .author(request.author())
            .isbn(request.isbn())
            .mainCategory(mainCat)
            .subCategory(request.subCategory())
            .publicationYear(request.publicationYear())
            .publisher(request.publisher())
            .edition(request.edition())
            .totalCopies(request.totalCopies())
            .availableCopies(request.totalCopies())
            .locationShelf(request.locationShelf())
            .language(request.language() != null ? request.language() : "English")
            .referenceOnly(request.referenceOnly())
            .description(request.description())
            .build();
        return BookResponse.from(bookRepository.save(book));
    }

    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        MainCategory mainCat = parseAndValidateCategory(request.mainCategory(), request.subCategory());
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setIsbn(request.isbn());
        book.setMainCategory(mainCat);
        book.setSubCategory(request.subCategory());
        book.setPublicationYear(request.publicationYear());
        book.setPublisher(request.publisher());
        book.setEdition(request.edition());
        book.setTotalCopies(request.totalCopies());
        book.setLocationShelf(request.locationShelf());
        book.setLanguage(request.language() != null ? request.language() : "English");
        book.setReferenceOnly(request.referenceOnly());
        book.setDescription(request.description());
        return BookResponse.from(bookRepository.save(book));
    }

    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        book.setDeleted(true);
        bookRepository.save(book);
    }

    @Transactional(readOnly = true)
    public BookResponse getBook(Long id) {
        Book book = bookRepository.findById(id)
            .filter(b -> !b.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return BookResponse.from(book);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(String query, String mainCategory, String subCategory, Pageable pageable) {
        MainCategory mainCat = null;
        if (mainCategory != null && !mainCategory.isEmpty()) {
            try {
                mainCat = MainCategory.valueOf(mainCategory.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidCategoryException("Invalid main category: " + mainCategory);
            }
        }
        return bookRepository.findWithFilters(
            query == null || query.isEmpty() ? null : query,
            mainCat,
            subCategory == null || subCategory.isEmpty() ? null : subCategory,
            pageable
        ).map(BookResponse::from);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getByCategory(String mainCategory) {
        try {
            MainCategory mainCat = MainCategory.valueOf(mainCategory.toUpperCase());
            return bookRepository.findByMainCategoryAndDeletedFalse(mainCat).stream()
                .map(BookResponse::from).toList();
        } catch (IllegalArgumentException e) {
            throw new InvalidCategoryException("Invalid main category: " + mainCategory);
        }
    }

    private MainCategory parseAndValidateCategory(String mainCategoryStr, String subCategory) {
        MainCategory mainCat;
        try {
            mainCat = MainCategory.valueOf(mainCategoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidCategoryException("Invalid main category: " + mainCategoryStr);
        }
        if (!mainCat.isValidSubcategory(subCategory)) {
            throw new InvalidCategoryException(
                "Subcategory '" + subCategory + "' is not valid for main category '" + mainCat + "'. " +
                "Valid subcategories: " + mainCat.getAllowedSubcategories());
        }
        return mainCat;
    }
}

package com.lms.service;

import com.lms.dto.BookCopyRequest;
import com.lms.dto.BookCopyResponse;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Book;
import com.lms.model.BookCopy;
import com.lms.model.enums.CopyCondition;
import com.lms.repository.BookCopyRepository;
import com.lms.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;

    public BookCopyResponse createCopy(BookCopyRequest request) {
        Book book = bookRepository.findById(request.bookId())
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + request.bookId()));

        BookCopy copy = BookCopy.builder()
            .book(book)
            .copyNumber(request.copyNumber())
            .barcode(request.barcode())
            .condition(request.condition() != null ? CopyCondition.valueOf(request.condition()) : CopyCondition.GOOD)
            .shelfLocation(request.shelfLocation())
            .rackNumber(request.rackNumber())
            .isAvailable(true)
            .build();

        BookCopy saved = bookCopyRepository.save(copy);

        // Update book counts
        book.setTotalCopies(book.getTotalCopies() + 1);
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return BookCopyResponse.from(saved);
    }

    public BookCopyResponse updateCopy(Long id, BookCopyRequest request) {
        BookCopy copy = bookCopyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BookCopy not found: " + id));

        copy.setBarcode(request.barcode());
        copy.setShelfLocation(request.shelfLocation());
        copy.setRackNumber(request.rackNumber());
        if (request.condition() != null) {
            copy.setCondition(CopyCondition.valueOf(request.condition()));
        }
        return BookCopyResponse.from(bookCopyRepository.save(copy));
    }

    public void deleteCopy(Long id) {
        BookCopy copy = bookCopyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BookCopy not found: " + id));
        Book book = copy.getBook();
        book.setTotalCopies(Math.max(0, book.getTotalCopies() - 1));
        if (copy.isAvailable()) {
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() - 1));
        }
        bookRepository.save(book);
        bookCopyRepository.delete(copy);
    }

    @Transactional(readOnly = true)
    public List<BookCopyResponse> getCopiesByBookId(Long bookId) {
        return bookCopyRepository.findByBookId(bookId).stream()
            .map(BookCopyResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BookCopyResponse getByBarcode(String barcode) {
        BookCopy copy = bookCopyRepository.findByBarcode(barcode)
            .orElseThrow(() -> new ResourceNotFoundException("BookCopy not found with barcode: " + barcode));
        return BookCopyResponse.from(copy);
    }
}

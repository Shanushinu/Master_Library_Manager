package com.lms.controller;

import com.lms.dto.BookCopyRequest;
import com.lms.dto.BookCopyResponse;
import com.lms.service.BookCopyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookCopyController {

    private final BookCopyService bookCopyService;

    @GetMapping("/{bookId}/copies")
    public ResponseEntity<List<BookCopyResponse>> getCopies(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookCopyService.getCopiesByBookId(bookId));
    }

    @PostMapping("/{bookId}/copies")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<BookCopyResponse> createCopy(@PathVariable Long bookId,
                                                        @Valid @RequestBody BookCopyRequest request) {
        return ResponseEntity.status(201).body(bookCopyService.createCopy(request));
    }

    @PutMapping("/copies/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<BookCopyResponse> updateCopy(@PathVariable Long id,
                                                        @Valid @RequestBody BookCopyRequest request) {
        return ResponseEntity.ok(bookCopyService.updateCopy(id, request));
    }

    @DeleteMapping("/copies/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCopy(@PathVariable Long id) {
        bookCopyService.deleteCopy(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/copies/barcode/{barcode}")
    public ResponseEntity<BookCopyResponse> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(bookCopyService.getByBarcode(barcode));
    }
}

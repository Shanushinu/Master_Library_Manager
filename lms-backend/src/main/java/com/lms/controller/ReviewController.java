package com.lms.controller;

import com.lms.dto.BookReviewRequest;
import com.lms.dto.BookReviewResponse;
import com.lms.service.BookReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.lms.repository.UserRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final BookReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping("/books/{bookId}/reviews")
    public ResponseEntity<BookReviewResponse> createReview(
            @PathVariable Long bookId,
            @Valid @RequestBody BookReviewRequest request,
            Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(201).body(reviewService.createReview(bookId, userId, request));
    }

    @GetMapping("/books/{bookId}/reviews")
    public ResponseEntity<List<BookReviewResponse>> getBookReviews(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        reviewService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

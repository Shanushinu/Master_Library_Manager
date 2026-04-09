package com.lms.service;

import com.lms.dto.BookReviewRequest;
import com.lms.dto.BookReviewResponse;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Book;
import com.lms.model.BookReview;
import com.lms.model.User;
import com.lms.repository.BookRepository;
import com.lms.repository.BookReviewRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookReviewService {

    private final BookReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BookReviewResponse createReview(Long bookId, Long userId, BookReviewRequest request) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Check if user already reviewed this book
        if (reviewRepository.findByUserIdAndBookId(userId, bookId).isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this book");
        }

        BookReview review = BookReview.builder()
            .user(user)
            .book(book)
            .rating(request.rating())
            .comment(request.comment())
            .build();

        return BookReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<BookReviewResponse> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
            .map(BookReviewResponse::from).toList();
    }

    public void deleteReview(Long reviewId, Long userId) {
        BookReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own reviews");
        }
        reviewRepository.delete(review);
    }
}

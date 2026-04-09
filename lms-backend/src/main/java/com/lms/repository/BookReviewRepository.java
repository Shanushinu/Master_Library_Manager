package com.lms.repository;

import com.lms.model.BookReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookReviewRepository extends JpaRepository<BookReview, Long> {

    List<BookReview> findByBookIdOrderByCreatedAtDesc(Long bookId);

    List<BookReview> findByUserId(Long userId);

    Optional<BookReview> findByUserIdAndBookId(Long userId, Long bookId);

    @Query("SELECT AVG(r.rating) FROM BookReview r WHERE r.book.id = :bookId")
    Double averageRatingByBookId(@Param("bookId") Long bookId);

    long countByBookId(Long bookId);
}

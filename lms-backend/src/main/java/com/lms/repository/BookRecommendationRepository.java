package com.lms.repository;

import com.lms.model.BookRecommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRecommendationRepository extends JpaRepository<BookRecommendation, Long> {
    List<BookRecommendation> findByUserId(Long userId);
    List<BookRecommendation> findByStatus(String status);
    Page<BookRecommendation> findByStatus(String status, Pageable pageable);
}

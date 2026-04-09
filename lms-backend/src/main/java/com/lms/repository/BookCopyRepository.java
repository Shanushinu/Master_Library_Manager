package com.lms.repository;

import com.lms.model.BookCopy;
import com.lms.model.enums.CopyCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    List<BookCopy> findByBookId(Long bookId);

    Optional<BookCopy> findByBarcode(String barcode);

    @Query("SELECT c FROM BookCopy c WHERE c.book.id = :bookId AND c.isAvailable = true AND c.condition <> 'LOST'")
    List<BookCopy> findAvailableByBookId(@Param("bookId") Long bookId);

    long countByBookIdAndIsAvailableTrue(Long bookId);

    List<BookCopy> findByBookIdAndCondition(Long bookId, CopyCondition condition);
}

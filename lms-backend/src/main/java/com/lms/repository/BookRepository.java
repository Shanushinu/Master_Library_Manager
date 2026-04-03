package com.lms.repository;

import com.lms.model.Book;
import com.lms.model.enums.MainCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByMainCategoryAndDeletedFalse(MainCategory mainCategory);

    List<Book> findByMainCategoryAndSubCategoryAndDeletedFalse(MainCategory mainCategory, String subCategory);

    List<Book> findByMainCategoryAndAvailableCopiesGreaterThanAndDeletedFalse(MainCategory mainCategory, int copies);

    Page<Book> findByDeletedFalseAndTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseAndDeletedFalse(
        String title, String author, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.deleted = false AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Book> searchBooks(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.deleted = false AND " +
           "(:mainCategory IS NULL OR b.mainCategory = :mainCategory) AND " +
           "(:subCategory IS NULL OR b.subCategory = :subCategory) AND " +
           "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Book> findWithFilters(@Param("query") String query,
                               @Param("mainCategory") MainCategory mainCategory,
                               @Param("subCategory") String subCategory,
                               Pageable pageable);

    @Query("SELECT b.mainCategory as category, COUNT(l) as loanCount " +
           "FROM Loan l JOIN l.book b GROUP BY b.mainCategory ORDER BY loanCount DESC")
    List<Object[]> getCirculationStatsByCategory();

    Optional<Book> findByIsbnAndDeletedFalse(String isbn);

    long countByDeletedFalse();
    long countByAvailableCopiesGreaterThanAndDeletedFalse(int copies);
}

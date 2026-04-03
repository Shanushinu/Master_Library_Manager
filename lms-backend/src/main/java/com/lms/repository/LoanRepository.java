package com.lms.repository;

import com.lms.model.Loan;
import com.lms.model.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserId(Long userId);

    List<Loan> findByUserIdAndReturnedDateIsNull(Long userId);

    List<Loan> findByUserIdAndStatus(Long userId, LoanStatus status);

    long countByUserIdAndReturnedDateIsNull(Long userId);

    @Query("SELECT l FROM Loan l WHERE l.dueDate < CURRENT_DATE AND l.returnedDate IS NULL")
    List<Loan> findOverdueLoans();

    @Query("SELECT l FROM Loan l WHERE l.dueDate < CURRENT_DATE AND l.returnedDate IS NULL")
    Page<Loan> findOverdueLoans(Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.book.id = :bookId AND l.returnedDate IS NULL")
    List<Loan> findActiveLoansForBook(@Param("bookId") Long bookId);

    List<Loan> findByBookIdAndReturnedDateIsNull(Long bookId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.dueDate < CURRENT_DATE AND l.returnedDate IS NULL")
    long countOverdueLoans();

    Page<Loan> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.dueDate BETWEEN :start AND :end AND l.returnedDate IS NULL")
    List<Loan> findLoansDueSoon(@Param("userId") Long userId,
                                 @Param("start") LocalDate start,
                                 @Param("end") LocalDate end);
}

package com.lms.repository;

import com.lms.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByLoanId(Long loanId);

    @Query("SELECT f FROM Fine f WHERE f.loan.user.id = :userId AND f.isPaid = false")
    List<Fine> findUnpaidByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM Fine f WHERE f.loan.user.id = :userId")
    List<Fine> findByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM Fine f WHERE f.isPaid = false")
    List<Fine> findAllUnpaid();
}

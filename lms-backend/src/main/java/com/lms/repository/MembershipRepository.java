package com.lms.repository;

import com.lms.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    List<Membership> findByUserId(Long userId);

    Optional<Membership> findByUserIdAndIsActiveTrue(Long userId);

    List<Membership> findByIsActiveTrueAndEndDateBefore(LocalDate date);

    long countByIsActiveTrue();
}

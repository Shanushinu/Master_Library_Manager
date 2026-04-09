package com.lms.repository;

import com.lms.model.ReadingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingGoalRepository extends JpaRepository<ReadingGoal, Long> {

    List<ReadingGoal> findByUserId(Long userId);

    Optional<ReadingGoal> findByUserIdAndYear(Long userId, Integer year);
}

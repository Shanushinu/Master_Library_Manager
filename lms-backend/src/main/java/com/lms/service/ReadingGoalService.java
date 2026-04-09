package com.lms.service;

import com.lms.dto.ReadingGoalRequest;
import com.lms.dto.ReadingGoalResponse;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.ReadingGoal;
import com.lms.model.User;
import com.lms.model.enums.GoalStatus;
import com.lms.repository.LoanRepository;
import com.lms.repository.ReadingGoalRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingGoalService {

    private final ReadingGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;

    public ReadingGoalResponse createGoal(Long userId, ReadingGoalRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (goalRepository.findByUserIdAndYear(userId, request.year()).isPresent()) {
            throw new IllegalArgumentException("You already have a reading goal for year " + request.year());
        }

        long completedBooks = loanRepository.countReturnedByUserId(userId);

        ReadingGoal goal = ReadingGoal.builder()
            .user(user)
            .year(request.year())
            .targetBooks(request.targetBooks())
            .completedBooks((int) completedBooks)
            .status(completedBooks >= request.targetBooks() ? GoalStatus.COMPLETED : GoalStatus.IN_PROGRESS)
            .build();

        return ReadingGoalResponse.from(goalRepository.save(goal));
    }

    public ReadingGoalResponse updateGoal(Long goalId, Long userId, ReadingGoalRequest request) {
        ReadingGoal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + goalId));
        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Goal does not belong to this user");
        }

        goal.setTargetBooks(request.targetBooks());
        if (goal.getCompletedBooks() >= request.targetBooks()) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else {
            goal.setStatus(GoalStatus.IN_PROGRESS);
        }

        return ReadingGoalResponse.from(goalRepository.save(goal));
    }

    @Transactional(readOnly = true)
    public List<ReadingGoalResponse> getMyGoals(Long userId) {
        return goalRepository.findByUserId(userId).stream()
            .map(ReadingGoalResponse::from).toList();
    }
}

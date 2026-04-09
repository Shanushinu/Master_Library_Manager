package com.lms.controller;

import com.lms.dto.ReadingGoalRequest;
import com.lms.dto.ReadingGoalResponse;
import com.lms.service.ReadingGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.lms.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final ReadingGoalService goalService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReadingGoalResponse> createGoal(
            @Valid @RequestBody ReadingGoalRequest request, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(201).body(goalService.createGoal(userId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReadingGoalResponse>> getMyGoals(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(goalService.getMyGoals(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReadingGoalResponse> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody ReadingGoalRequest request,
            Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(goalService.updateGoal(id, userId, request));
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

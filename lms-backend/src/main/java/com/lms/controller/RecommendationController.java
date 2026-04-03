package com.lms.controller;

import com.lms.dto.RecommendationRequest;
import com.lms.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.lms.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> createRecommendation(
            @Valid @RequestBody RecommendationRequest request, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(201).body(recommendationService.createRecommendation(userId, request));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRecommendations() {
        return ResponseEntity.ok(recommendationService.getPendingRecommendations());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyRecommendations(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(recommendationService.getMyRecommendations(userId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(recommendationService.updateStatus(id, body.get("status")));
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

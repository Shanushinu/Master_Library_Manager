package com.lms.service;

import com.lms.dto.RecommendationRequest;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.BookRecommendation;
import com.lms.model.User;
import com.lms.repository.BookRecommendationRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class RecommendationService {

    private final BookRecommendationRepository recommendationRepository;
    private final UserRepository userRepository;

    public Map<String, Object> createRecommendation(Long userId, RecommendationRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        BookRecommendation rec = BookRecommendation.builder()
            .user(user)
            .title(request.title())
            .author(request.author())
            .isbn(request.isbn())
            .reason(request.reason())
            .status("PENDING")
            .build();
        BookRecommendation saved = recommendationRepository.save(rec);
        return toMap(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingRecommendations() {
        return recommendationRepository.findByStatus("PENDING").stream().map(this::toMap).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyRecommendations(Long userId) {
        return recommendationRepository.findByUserId(userId).stream().map(this::toMap).toList();
    }

    public Map<String, Object> updateStatus(Long id, String status) {
        BookRecommendation rec = recommendationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found: " + id));
        rec.setStatus(status);
        return toMap(recommendationRepository.save(rec));
    }

    private Map<String, Object> toMap(BookRecommendation rec) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rec.getId());
        map.put("title", rec.getTitle());
        map.put("author", rec.getAuthor());
        map.put("isbn", rec.getIsbn());
        map.put("reason", rec.getReason());
        map.put("status", rec.getStatus());
        map.put("userId", rec.getUser().getId());
        map.put("userName", rec.getUser().getName());
        map.put("createdAt", rec.getCreatedAt());
        return map;
    }
}

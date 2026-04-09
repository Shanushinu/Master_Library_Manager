package com.lms.controller;

import com.lms.dto.FineResponse;
import com.lms.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.lms.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    public ResponseEntity<List<FineResponse>> getMyFines(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(fineService.getMyFines(userId));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<FineResponse> payFine(@PathVariable Long id) {
        return ResponseEntity.ok(fineService.payFine(id));
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

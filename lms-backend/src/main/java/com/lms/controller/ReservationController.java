package com.lms.controller;

import com.lms.dto.ReservationResponse;
import com.lms.service.ReservationService;
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
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReservationResponse> placeReservation(
            @RequestBody Map<String, Long> request, Authentication auth) {
        Long userId = getUserId(auth);
        Long bookId = request.get("bookId");
        return ResponseEntity.status(201).body(reservationService.placeReservation(bookId, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        reservationService.cancelReservation(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(reservationService.getMyReservations(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

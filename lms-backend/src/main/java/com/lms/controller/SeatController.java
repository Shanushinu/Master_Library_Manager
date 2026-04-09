package com.lms.controller;

import com.lms.dto.ReadingRoomResponse;
import com.lms.dto.SeatBookingRequest;
import com.lms.dto.SeatBookingResponse;
import com.lms.repository.ReadingRoomRepository;
import com.lms.service.SeatBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.lms.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatBookingService seatBookingService;
    private final ReadingRoomRepository readingRoomRepository;
    private final UserRepository userRepository;

    @GetMapping("/available")
    public ResponseEntity<List<Integer>> getAvailableSeats(
            @RequestParam Long room,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(seatBookingService.getAvailableSeats(room, date));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ReadingRoomResponse>> getRooms() {
        return ResponseEntity.ok(readingRoomRepository.findAll().stream()
            .map(ReadingRoomResponse::from).toList());
    }

    @PostMapping("/book")
    public ResponseEntity<SeatBookingResponse> bookSeat(
            @Valid @RequestBody SeatBookingRequest request, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(201).body(seatBookingService.bookSeat(userId, request));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        seatBookingService.cancelBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<SeatBookingResponse>> getMyBookings(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(seatBookingService.getMyBookings(userId));
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

package com.lms.service;

import com.lms.dto.SeatBookingRequest;
import com.lms.dto.SeatBookingResponse;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.ReadingRoom;
import com.lms.model.SeatBooking;
import com.lms.model.User;
import com.lms.model.enums.BookingStatus;
import com.lms.repository.ReadingRoomRepository;
import com.lms.repository.SeatBookingRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class SeatBookingService {

    private final SeatBookingRepository seatBookingRepository;
    private final ReadingRoomRepository readingRoomRepository;
    private final UserRepository userRepository;

    public SeatBookingResponse bookSeat(Long userId, SeatBookingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        ReadingRoom room = readingRoomRepository.findById(request.roomId())
            .orElseThrow(() -> new ResourceNotFoundException("Reading room not found: " + request.roomId()));

        if (request.seatNumber() < 1 || request.seatNumber() > room.getTotalSeats()) {
            throw new IllegalArgumentException("Invalid seat number. Room has " + room.getTotalSeats() + " seats.");
        }

        // Check for conflict
        List<SeatBooking> conflicts = seatBookingRepository.findConflicting(
            request.roomId(), request.bookingDate(), request.seatNumber());
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Seat " + request.seatNumber() + " is already booked for this date.");
        }

        SeatBooking booking = SeatBooking.builder()
            .user(user)
            .room(room)
            .seatNumber(request.seatNumber())
            .bookingDate(request.bookingDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .status(BookingStatus.CONFIRMED)
            .build();

        return SeatBookingResponse.from(seatBookingRepository.save(booking));
    }

    public void cancelBooking(Long bookingId, Long userId) {
        SeatBooking booking = seatBookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Booking does not belong to this user");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        seatBookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Integer> getAvailableSeats(Long roomId, LocalDate date) {
        ReadingRoom room = readingRoomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Reading room not found: " + roomId));

        Set<Integer> bookedSeats = seatBookingRepository.findBookedByRoomAndDate(roomId, date).stream()
            .map(SeatBooking::getSeatNumber)
            .collect(Collectors.toSet());

        return IntStream.rangeClosed(1, room.getTotalSeats())
            .filter(seat -> !bookedSeats.contains(seat))
            .boxed().toList();
    }

    @Transactional(readOnly = true)
    public List<SeatBookingResponse> getMyBookings(Long userId) {
        return seatBookingRepository.findByUserId(userId).stream()
            .map(SeatBookingResponse::from).toList();
    }
}

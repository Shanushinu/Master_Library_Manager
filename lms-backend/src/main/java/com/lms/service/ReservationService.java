package com.lms.service;

import com.lms.dto.ReservationResponse;
import com.lms.exception.BookNotAvailableException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Book;
import com.lms.model.Reservation;
import com.lms.model.User;
import com.lms.model.enums.ReservationStatus;
import com.lms.repository.BookRepository;
import com.lms.repository.ReservationRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReservationResponse placeReservation(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Check if user already has active reservation for this book
        boolean alreadyReserved = reservationRepository.existsByUserIdAndBookIdAndStatusIn(
            userId, bookId, List.of(ReservationStatus.PENDING, ReservationStatus.READY));
        if (alreadyReserved) {
            throw new BookNotAvailableException("You already have an active reservation for this book");
        }

        long queueSize = reservationRepository.countByBookIdAndStatus(bookId, ReservationStatus.PENDING);

        Reservation reservation = Reservation.builder()
            .book(book)
            .user(user)
            .status(ReservationStatus.PENDING)
            .queuePosition((int) queueSize + 1)
            .build();

        // If book is available, mark as ready immediately
        if (book.getAvailableCopies() > 0) {
            reservation.setStatus(ReservationStatus.READY);
            reservation.setExpiryDate(java.time.LocalDate.now().plusDays(3));
        }

        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    public void cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + reservationId));
        if (!reservation.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Reservation does not belong to this user");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream().map(ReservationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream().map(ReservationResponse::from).toList();
    }
}

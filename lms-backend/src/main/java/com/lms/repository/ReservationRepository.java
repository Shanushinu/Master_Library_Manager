package com.lms.repository;

import com.lms.model.Reservation;
import com.lms.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    List<Reservation> findByBookIdAndStatus(Long bookId, ReservationStatus status);

    Optional<Reservation> findByUserIdAndBookIdAndStatusIn(Long userId, Long bookId, List<ReservationStatus> statuses);

    boolean existsByUserIdAndBookIdAndStatusIn(Long userId, Long bookId, List<ReservationStatus> statuses);

    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Reservation> findNextInQueue(@Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'READY' AND r.expiryDate < :today")
    List<Reservation> findExpiredReservations(@Param("today") LocalDate today);

    long countByBookIdAndStatus(Long bookId, ReservationStatus status);
}

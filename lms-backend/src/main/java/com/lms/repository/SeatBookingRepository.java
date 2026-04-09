package com.lms.repository;

import com.lms.model.SeatBooking;
import com.lms.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeatBookingRepository extends JpaRepository<SeatBooking, Long> {

    @Query("SELECT sb FROM SeatBooking sb WHERE sb.room.id = :roomId AND sb.bookingDate = :date AND sb.status = 'CONFIRMED'")
    List<SeatBooking> findBookedByRoomAndDate(@Param("roomId") Long roomId, @Param("date") LocalDate date);

    List<SeatBooking> findByUserIdAndBookingDate(Long userId, LocalDate bookingDate);

    List<SeatBooking> findByUserId(Long userId);

    @Query("SELECT sb FROM SeatBooking sb WHERE sb.room.id = :roomId AND sb.bookingDate = :date " +
           "AND sb.seatNumber = :seatNumber AND sb.status = 'CONFIRMED'")
    List<SeatBooking> findConflicting(@Param("roomId") Long roomId,
                                       @Param("date") LocalDate date,
                                       @Param("seatNumber") Integer seatNumber);
}

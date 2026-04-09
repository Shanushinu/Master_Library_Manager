package com.lms.model;

import com.lms.model.enums.BookingSlot;
import com.lms.model.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "seat_bookings", indexes = {
    @Index(name = "idx_seat_bookings_user", columnList = "user_id"),
    @Index(name = "idx_seat_bookings_date_room", columnList = "bookingDate, room_id"),
    @Index(name = "idx_seat_bookings_status", columnList = "status")
},
uniqueConstraints = @UniqueConstraint(name = "uk_seat_bookings_slot",
    columnNames = {"room_id", "seatNumber", "bookingDate", "slot"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ReadingRoom room;

    @Column(nullable = false)
    private Integer seatNumber;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingSlot slot = BookingSlot.FULL_DAY;

    private LocalTime startTime;

    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

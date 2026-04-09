package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 20)
    private String floor;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalSeats = 30;

    @Column(nullable = false)
    @Builder.Default
    private LocalTime openTime = LocalTime.of(9, 0);

    @Column(nullable = false)
    @Builder.Default
    private LocalTime closeTime = LocalTime.of(17, 0);

    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

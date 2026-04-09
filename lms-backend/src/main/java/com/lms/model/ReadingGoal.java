package com.lms.model;

import com.lms.model.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_goals", indexes = {
    @Index(name = "idx_goals_user_year", columnList = "user_id, year", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer targetBooks;

    @Builder.Default
    private Integer completedBooks = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

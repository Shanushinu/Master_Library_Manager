package com.lms.model;

import com.lms.model.enums.CopyCondition;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "book_copies", indexes = {
    @Index(name = "idx_book_copies_barcode", columnList = "barcode", unique = true),
    @Index(name = "idx_book_copies_available", columnList = "isAvailable"),
    @Index(name = "idx_book_copies_condition", columnList = "condition")
},
uniqueConstraints = @UniqueConstraint(name = "uk_book_copies_number",
    columnNames = {"book_id", "copyNumber"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Integer copyNumber;

    @Column(unique = true, length = 50)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CopyCondition condition = CopyCondition.GOOD;

    @Builder.Default
    private boolean isAvailable = true;

    @Column(length = 100)
    private String shelfLocation;

    @Column(length = 20)
    private String rackNumber;

    private LocalDate acquiredDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

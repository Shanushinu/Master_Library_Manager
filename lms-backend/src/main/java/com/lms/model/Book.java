package com.lms.model;

import com.lms.model.enums.MainCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_books_category", columnList = "mainCategory, subCategory"),
    @Index(name = "idx_books_isbn", columnList = "isbn")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String author;

    @Column(unique = true)
    private String isbn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MainCategory mainCategory;

    @Column(nullable = false)
    private String subCategory;

    private Integer publicationYear;

    private String publisher;

    private String edition;

    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer totalCopies = 1;

    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer availableCopies = 1;

    private String locationShelf;

    @Builder.Default
    private String language = "English";

    @Builder.Default
    private boolean referenceOnly = false;

    @Builder.Default
    private boolean deleted = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Loan> loans = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();
}

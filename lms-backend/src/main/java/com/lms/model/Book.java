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
    @Index(name = "idx_books_isbn", columnList = "isbn"),
    @Index(name = "idx_books_genre", columnList = "genre"),
    @Index(name = "idx_books_available", columnList = "availableCopies")
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
    @Column(nullable = false, length = 500)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 300)
    private String author;

    @Column(unique = true, length = 20)
    private String isbn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MainCategory mainCategory;

    @Column(nullable = false, length = 100)
    private String subCategory;

    @Column(length = 100)
    private String genre;

    @Column(length = 100)
    private String subGenre;

    private Integer publicationYear;

    @Column(length = 300)
    private String publisher;

    @Column(length = 50)
    private String edition;

    @Column(length = 500)
    private String coverUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

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
    @Column(length = 50)
    private String language = "English";

    @Builder.Default
    private boolean referenceOnly = false;

    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BookCopy> copies = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BookReview> reviews = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "book_categories",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id"))
    @Builder.Default
    private List<Category> categories = new ArrayList<>();
}

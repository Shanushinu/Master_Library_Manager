package com.lms.model;

import com.lms.model.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans", indexes = {
    @Index(name = "idx_loans_user", columnList = "user_id"),
    @Index(name = "idx_loans_copy", columnList = "book_copy_id"),
    @Index(name = "idx_loans_status", columnList = "status"),
    @Index(name = "idx_loans_due_date", columnList = "dueDate"),
    @Index(name = "idx_loans_status_due", columnList = "status, dueDate")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_copy_id")
    private BookCopy bookCopy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    @Column(nullable = false)
    private LocalDate checkoutDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate returnedDate;

    @Builder.Default
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Builder.Default
    private boolean finePaid = false;

    @Builder.Default
    private int renewalCount = 0;

    @Builder.Default
    private int maxRenewals = 3;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Legacy field kept for backward compat
    private Long approvedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Fine> fines = new ArrayList<>();

    // backward compat alias
    public int getRenewedCount() {
        return renewalCount;
    }

    public void setRenewedCount(int count) {
        this.renewalCount = count;
    }
}

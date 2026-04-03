package com.lms.service;

import com.lms.dto.LoanResponse;
import com.lms.exception.*;
import com.lms.model.Book;
import com.lms.model.Loan;
import com.lms.model.User;
import com.lms.model.enums.LoanStatus;
import com.lms.model.enums.UserRole;
import com.lms.repository.BookRepository;
import com.lms.repository.LoanRepository;
import com.lms.repository.ReservationRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final AuditService auditService;

    private static final BigDecimal FINE_RATE_PER_DAY = new BigDecimal("0.50");
    private static final BigDecimal MAX_FINE = new BigDecimal("50.00");
    private static final BigDecimal FINE_THRESHOLD = new BigDecimal("10.00");

    public LoanResponse checkout(Long bookId, Long userId, Long librarianId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // School students cannot borrow reference-only books
        if (book.isReferenceOnly() && user.getRole() == UserRole.ROLE_SCHOOL_STUDENT) {
            throw new BorrowingLimitExceededException("School students cannot borrow reference-only books");
        }

        // Check available copies
        if (book.getAvailableCopies() <= 0) {
            throw new BookNotAvailableException("Book '" + book.getTitle() + "' is not available");
        }

        // Check max loans per role
        long activeLoans = loanRepository.countByUserIdAndReturnedDateIsNull(userId);
        int maxLoans = getMaxLoans(user.getRole());
        if (activeLoans >= maxLoans) {
            throw new BorrowingLimitExceededException(
                "User has reached maximum loan limit of " + maxLoans + " books for role " + user.getRole());
        }

        // Check outstanding fines > $10
        BigDecimal outstandingFine = calculateTotalOutstandingFine(userId);
        if (outstandingFine.compareTo(FINE_THRESHOLD) > 0) {
            throw new OverdueFineException(
                "User has outstanding fines of $" + outstandingFine + ". Please clear fines before borrowing.");
        }

        LocalDate checkoutDate = LocalDate.now();
        LocalDate dueDate = checkoutDate.plusDays(getLoanDays(user.getRole()));

        Loan loan = Loan.builder()
            .book(book)
            .user(user)
            .checkoutDate(checkoutDate)
            .dueDate(dueDate)
            .status(LoanStatus.ACTIVE)
            .approvedBy(librarianId)
            .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);
        auditService.log(librarianId, "CHECKOUT", "LOAN", savedLoan.getId(),
            "Checked out '" + book.getTitle() + "' to " + user.getName());

        return LoanResponse.from(savedLoan);
    }

    public LoanResponse returnBook(Long loanId, Long librarianId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        if (loan.getReturnedDate() != null) {
            throw new IllegalArgumentException("Book already returned");
        }

        LocalDate today = LocalDate.now();
        loan.setReturnedDate(today);

        BigDecimal fine = calculateFine(loan);
        loan.setFineAmount(fine);
        loan.setStatus(LoanStatus.RETURNED);

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);

        // Auto-assign reservation if any pending
        reservationRepository.findNextInQueue(book.getId()).stream().findFirst().ifPresent(res -> {
            res.setStatus(com.lms.model.enums.ReservationStatus.READY);
            res.setExpiryDate(today.plusDays(3));
            res.setNotifiedAt(java.time.LocalDateTime.now());
            reservationRepository.save(res);
        });

        auditService.log(librarianId, "RETURN", "LOAN", loanId,
            "Returned '" + book.getTitle() + "'. Fine: $" + fine);

        return LoanResponse.from(savedLoan);
    }

    public LoanResponse renewLoan(Long loanId, Long userId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        if (!loan.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Loan does not belong to this user");
        }
        if (loan.getReturnedDate() != null) {
            throw new RenewalNotAllowedException("Cannot renew a returned book");
        }

        int maxRenewals = getMaxRenewals(loan.getUser().getRole());
        if (loan.getRenewedCount() >= maxRenewals) {
            throw new RenewalNotAllowedException(
                "Maximum renewals (" + maxRenewals + ") reached for your role");
        }

        // Cannot renew if book has active reservation
        long activeReservations = reservationRepository.countByBookIdAndStatus(
            loan.getBook().getId(), com.lms.model.enums.ReservationStatus.PENDING);
        if (activeReservations > 0) {
            throw new RenewalNotAllowedException("Cannot renew: book has " + activeReservations + " patron(s) waiting");
        }

        int additionalDays = getLoanDays(loan.getUser().getRole());
        loan.setDueDate(loan.getDueDate().plusDays(additionalDays));
        loan.setRenewedCount(loan.getRenewedCount() + 1);
        loan.setStatus(LoanStatus.RENEWED);

        return LoanResponse.from(loanRepository.save(loan));
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getMyLoans(Long userId) {
        return loanRepository.findByUserId(userId).stream().map(LoanResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<LoanResponse> getAllLoans(Pageable pageable) {
        return loanRepository.findAll(pageable).map(LoanResponse::from);
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getOverdueLoans() {
        return loanRepository.findOverdueLoans().stream().map(LoanResponse::from).toList();
    }

    private BigDecimal calculateFine(Loan loan) {
        if (loan.getReturnedDate() == null) return BigDecimal.ZERO;
        if (!loan.getReturnedDate().isAfter(loan.getDueDate())) return BigDecimal.ZERO;

        // Faculty: no fine if overdue < 7 days
        if (loan.getUser().getRole() == UserRole.ROLE_FACULTY) {
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), loan.getReturnedDate());
            if (daysOverdue < 7) return BigDecimal.ZERO;
        }

        long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), loan.getReturnedDate());
        BigDecimal fine = FINE_RATE_PER_DAY.multiply(BigDecimal.valueOf(daysOverdue));
        return fine.min(MAX_FINE);
    }

    private BigDecimal calculateTotalOutstandingFine(Long userId) {
        return loanRepository.findByUserId(userId).stream()
            .filter(l -> !l.isFinePaid() && l.getFineAmount().compareTo(BigDecimal.ZERO) > 0)
            .map(Loan::getFineAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int getMaxLoans(UserRole role) {
        return switch (role) {
            case ROLE_COLLEGE_STUDENT -> 5;
            case ROLE_SCHOOL_STUDENT -> 3;
            case ROLE_FACULTY -> 10;
            default -> 4;
        };
    }

    private int getLoanDays(UserRole role) {
        return switch (role) {
            case ROLE_COLLEGE_STUDENT -> 21;
            case ROLE_SCHOOL_STUDENT -> 14;
            case ROLE_FACULTY -> 30;
            default -> 21;
        };
    }

    private int getMaxRenewals(UserRole role) {
        return switch (role) {
            case ROLE_FACULTY -> 2;
            default -> 1;
        };
    }
}

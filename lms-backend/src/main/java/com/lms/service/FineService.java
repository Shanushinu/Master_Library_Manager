package com.lms.service;

import com.lms.dto.FineResponse;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Fine;
import com.lms.model.Loan;
import com.lms.repository.FineRepository;
import com.lms.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FineService {

    private final FineRepository fineRepository;
    private final LoanRepository loanRepository;

    public Fine createFine(Loan loan, BigDecimal amount, String reason) {
        Fine fine = Fine.builder()
            .loan(loan)
            .amount(amount)
            .reason(reason)
            .isPaid(false)
            .build();
        return fineRepository.save(fine);
    }

    public FineResponse payFine(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
            .orElseThrow(() -> new ResourceNotFoundException("Fine not found: " + fineId));

        if (fine.isPaid()) {
            throw new IllegalArgumentException("Fine is already paid");
        }

        fine.setPaid(true);
        fine.setPaidAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        // Also update the loan's fine status
        Loan loan = fine.getLoan();
        List<Fine> unpaidFines = fineRepository.findByLoanId(loan.getId()).stream()
            .filter(f -> !f.isPaid()).toList();
        if (unpaidFines.isEmpty()) {
            loan.setFinePaid(true);
            loanRepository.save(loan);
        }

        return FineResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getMyFines(Long userId) {
        return fineRepository.findByUserId(userId).stream()
            .map(FineResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getUnpaidFines(Long userId) {
        return fineRepository.findUnpaidByUserId(userId).stream()
            .map(FineResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getAllUnpaidFines() {
        return fineRepository.findAllUnpaid().stream()
            .map(FineResponse::from).toList();
    }
}

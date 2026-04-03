package com.lms.controller;

import com.lms.dto.CheckoutRequest;
import com.lms.dto.LoanResponse;
import com.lms.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.lms.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final UserRepository userRepository;

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<LoanResponse> checkout(@Valid @RequestBody CheckoutRequest request,
                                                  Authentication auth) {
        Long librarianId = getUserId(auth);
        return ResponseEntity.status(201).body(loanService.checkout(request.bookId(), request.userId(), librarianId));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<LoanResponse> returnBook(@PathVariable Long id, Authentication auth) {
        Long librarianId = getUserId(auth);
        return ResponseEntity.ok(loanService.returnBook(id, librarianId));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<LoanResponse> renewLoan(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(loanService.renewLoan(id, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> getMyLoans(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(loanService.getMyLoans(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<Page<LoanResponse>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(loanService.getAllLoans(PageRequest.of(page, size)));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyAuthority('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<List<LoanResponse>> getOverdueLoans() {
        return ResponseEntity.ok(loanService.getOverdueLoans());
    }

    private Long getUserId(Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.lms.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}

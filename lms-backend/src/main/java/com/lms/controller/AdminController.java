package com.lms.controller;

import com.lms.dto.UserResponse;
import com.lms.service.AuditService;
import com.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditService auditService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> changeRole(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.changeRole(id, body.get("role")));
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<UserResponse> toggleUser(@PathVariable Long id,
                                                    @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(userService.toggleUser(id, body.get("enabled")));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<?>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }
}

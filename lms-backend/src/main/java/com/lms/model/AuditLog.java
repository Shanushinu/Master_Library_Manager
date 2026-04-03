package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userEmail;

    @Column(nullable = false)
    private String action;

    private String entityType;
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String ipAddress;

    @CreationTimestamp
    private LocalDateTime timestamp;
}

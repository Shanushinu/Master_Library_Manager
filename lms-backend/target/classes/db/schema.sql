-- ============================================================================
-- LIBRARY MANAGEMENT SYSTEM — Complete MySQL Schema
-- Generated: 2026-04-06
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- STEP 1: USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id`            CHAR(36)        NOT NULL  COMMENT 'UUID primary key',
    `name`          VARCHAR(150)    NOT NULL,
    `email`         VARCHAR(255)    NOT NULL,
    `password_hash` VARCHAR(255)    NOT NULL,
    `role`          ENUM('ADMIN','LIBRARIAN','FACULTY','COLLEGE_STUDENT','SCHOOL_STUDENT','GENERAL_PATRON')
                                    NOT NULL  DEFAULT 'GENERAL_PATRON',
    `student_id`    VARCHAR(50)     DEFAULT NULL  COMMENT 'Only for student roles',
    `phone`         VARCHAR(20)     DEFAULT NULL,
    `avatar_url`    VARCHAR(500)    DEFAULT NULL,
    `is_active`     BOOLEAN         NOT NULL  DEFAULT TRUE,
    `created_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_student_id` (`student_id`),
    INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `memberships` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`           CHAR(36)        NOT NULL,
    `type`              ENUM('MONTHLY','QUARTERLY','YEARLY','LIFETIME')
                                        NOT NULL,
    `start_date`        DATE            NOT NULL,
    `end_date`          DATE            DEFAULT NULL  COMMENT 'NULL for LIFETIME',
    `max_books_allowed` INT UNSIGNED    NOT NULL  DEFAULT 5,
    `is_active`         BOOLEAN         NOT NULL  DEFAULT TRUE,
    `created_at`        TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_memberships_user` (`user_id`),
    INDEX `idx_memberships_active` (`is_active`, `end_date`),
    CONSTRAINT `fk_memberships_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`     CHAR(36)        NOT NULL,
    `token`       VARCHAR(512)    NOT NULL,
    `expires_at`  TIMESTAMP       NOT NULL,
    `created_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refresh_tokens_token` (`token`),
    INDEX `idx_refresh_tokens_user` (`user_id`),
    INDEX `idx_refresh_tokens_expires` (`expires_at`),
    CONSTRAINT `fk_refresh_tokens_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- STEP 2: BOOK CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS `books` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `isbn`              VARCHAR(20)     DEFAULT NULL,
    `title`             VARCHAR(500)    NOT NULL,
    `author`            VARCHAR(300)    NOT NULL,
    `publisher`         VARCHAR(300)    DEFAULT NULL,
    `publication_year`  YEAR            DEFAULT NULL,
    `language`          VARCHAR(50)     DEFAULT 'English',
    `edition`           VARCHAR(50)     DEFAULT NULL,
    `genre`             VARCHAR(100)    DEFAULT NULL,
    `sub_genre`         VARCHAR(100)    DEFAULT NULL,
    `description`       TEXT            DEFAULT NULL,
    `cover_url`         VARCHAR(500)    DEFAULT NULL,
    `total_copies`      INT UNSIGNED    NOT NULL  DEFAULT 1,
    `available_copies`  INT UNSIGNED    NOT NULL  DEFAULT 1,
    `reference_only`    BOOLEAN         NOT NULL  DEFAULT FALSE,
    `created_at`        TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_books_isbn` (`isbn`),
    INDEX `idx_books_genre` (`genre`),
    INDEX `idx_books_language` (`language`),
    INDEX `idx_books_available` (`available_copies`),
    FULLTEXT INDEX `ft_books_search` (`title`, `author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `book_copies` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `book_id`         BIGINT UNSIGNED NOT NULL,
    `copy_number`     INT UNSIGNED    NOT NULL,
    `barcode`         VARCHAR(50)     NOT NULL,
    `condition`       ENUM('GOOD','FAIR','DAMAGED','LOST')
                                      NOT NULL  DEFAULT 'GOOD',
    `shelf_location`  VARCHAR(100)    DEFAULT NULL  COMMENT 'e.g. A-3-12',
    `rack_number`     VARCHAR(20)     DEFAULT NULL,
    `is_available`    BOOLEAN         NOT NULL  DEFAULT TRUE,
    `acquired_date`   DATE            DEFAULT NULL,
    `created_at`      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_book_copies_barcode` (`barcode`),
    UNIQUE KEY `uk_book_copies_number` (`book_id`, `copy_number`),
    INDEX `idx_book_copies_available` (`is_available`),
    INDEX `idx_book_copies_condition` (`condition`),
    CONSTRAINT `fk_book_copies_book`
        FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `categories` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100)    NOT NULL,
    `parent_id`   BIGINT UNSIGNED DEFAULT NULL  COMMENT 'Self-ref for hierarchy',
    `description` VARCHAR(500)    DEFAULT NULL,
    `created_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_categories_parent` (`parent_id`),
    UNIQUE KEY `uk_categories_name_parent` (`name`, `parent_id`),
    CONSTRAINT `fk_categories_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `book_categories` (
    `book_id`     BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`book_id`, `category_id`),
    INDEX `idx_book_categories_cat` (`category_id`),
    CONSTRAINT `fk_book_categories_book`
        FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_book_categories_cat`
        FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- STEP 3: TRANSACTIONS (Loans, Fines, Reservations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `loans` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`       CHAR(36)        NOT NULL,
    `book_copy_id`  BIGINT UNSIGNED NOT NULL,
    `issued_by`     CHAR(36)        NOT NULL  COMMENT 'Librarian/Admin who issued',
    `issue_date`    DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `due_date`      DATETIME        NOT NULL,
    `return_date`   DATETIME        DEFAULT NULL,
    `status`        ENUM('ACTIVE','RETURNED','OVERDUE','RENEWED','LOST')
                                    NOT NULL  DEFAULT 'ACTIVE',
    `renewal_count` INT UNSIGNED    NOT NULL  DEFAULT 0,
    `max_renewals`  INT UNSIGNED    NOT NULL  DEFAULT 3,
    `notes`         TEXT            DEFAULT NULL,
    `created_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_loans_user` (`user_id`),
    INDEX `idx_loans_copy` (`book_copy_id`),
    INDEX `idx_loans_status` (`status`),
    INDEX `idx_loans_due_date` (`due_date`),
    INDEX `idx_loans_issued_by` (`issued_by`),
    INDEX `idx_loans_status_due` (`status`, `due_date`),
    CONSTRAINT `fk_loans_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_loans_copy`
        FOREIGN KEY (`book_copy_id`) REFERENCES `book_copies` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_loans_issued_by`
        FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `fines` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `loan_id`     BIGINT UNSIGNED NOT NULL,
    `user_id`     CHAR(36)        NOT NULL,
    `amount`      DECIMAL(8,2)    NOT NULL  DEFAULT 0.00  COMMENT 'Amount in ₹',
    `reason`      VARCHAR(500)    DEFAULT NULL,
    `is_paid`     BOOLEAN         NOT NULL  DEFAULT FALSE,
    `paid_at`     DATETIME        DEFAULT NULL,
    `paid_amount` DECIMAL(8,2)    DEFAULT NULL,
    `created_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_fines_loan` (`loan_id`),
    INDEX `idx_fines_user` (`user_id`),
    INDEX `idx_fines_unpaid` (`is_paid`, `user_id`),
    CONSTRAINT `fk_fines_loan`
        FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_fines_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `reservations` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`         CHAR(36)        NOT NULL,
    `book_id`         BIGINT UNSIGNED NOT NULL,
    `reserved_at`     DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `expires_at`      DATETIME        DEFAULT NULL  COMMENT 'Auto-expire after N days',
    `status`          ENUM('PENDING','READY','FULFILLED','CANCELLED','EXPIRED')
                                      NOT NULL  DEFAULT 'PENDING',
    `queue_position`  INT UNSIGNED    NOT NULL  DEFAULT 1,
    `created_at`      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_reservations_user` (`user_id`),
    INDEX `idx_reservations_book_status` (`book_id`, `status`),
    INDEX `idx_reservations_status` (`status`),
    INDEX `idx_reservations_expires` (`expires_at`),
    CONSTRAINT `fk_reservations_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reservations_book`
        FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- STEP 4: ENGAGEMENT (Notifications, Reviews, Goals)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `notifications` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`         CHAR(36)        NOT NULL,
    `title`           VARCHAR(255)    NOT NULL,
    `message`         TEXT            NOT NULL,
    `type`            ENUM('DUE_REMINDER','OVERDUE','RESERVATION_READY',
                           'FINE_ADDED','FINE_PAID','GENERAL','SYSTEM')
                                      NOT NULL  DEFAULT 'GENERAL',
    `is_read`         BOOLEAN         NOT NULL  DEFAULT FALSE,
    `reference_id`    BIGINT UNSIGNED DEFAULT NULL  COMMENT 'ID of related entity',
    `reference_type`  VARCHAR(50)     DEFAULT NULL  COMMENT 'e.g. LOAN, FINE, RESERVATION',
    `created_at`      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_unread` (`user_id`, `is_read`),
    INDEX `idx_notifications_type` (`type`),
    INDEX `idx_notifications_ref` (`reference_type`, `reference_id`),
    CONSTRAINT `fk_notifications_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `book_reviews` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`     CHAR(36)        NOT NULL,
    `book_id`     BIGINT UNSIGNED NOT NULL,
    `rating`      TINYINT UNSIGNED NOT NULL  COMMENT '1-5 stars',
    `comment`     TEXT            DEFAULT NULL,
    `created_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_book_reviews_user_book` (`user_id`, `book_id`),
    INDEX `idx_book_reviews_book` (`book_id`),
    INDEX `idx_book_reviews_rating` (`book_id`, `rating`),
    CONSTRAINT `fk_book_reviews_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_book_reviews_book`
        FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_rating_range`
        CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `reading_goals` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`          CHAR(36)        NOT NULL,
    `year`             YEAR            NOT NULL,
    `target_count`     INT UNSIGNED    NOT NULL  DEFAULT 12,
    `completed_count`  INT UNSIGNED    NOT NULL  DEFAULT 0,
    `status`           ENUM('IN_PROGRESS','COMPLETED','FAILED')
                                       NOT NULL  DEFAULT 'IN_PROGRESS',
    `created_at`       TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reading_goals_user_year` (`user_id`, `year`),
    CONSTRAINT `fk_reading_goals_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `reading_goal_books` (
    `goal_id`      BIGINT UNSIGNED NOT NULL,
    `loan_id`      BIGINT UNSIGNED NOT NULL,
    `completed_at` DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`goal_id`, `loan_id`),
    CONSTRAINT `fk_goal_books_goal`
        FOREIGN KEY (`goal_id`) REFERENCES `reading_goals` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_goal_books_loan`
        FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- STEP 5: FACILITIES & AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS `reading_rooms` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100)    NOT NULL,
    `floor`       VARCHAR(20)     DEFAULT NULL,
    `total_seats` INT UNSIGNED    NOT NULL  DEFAULT 30,
    `open_time`   TIME            NOT NULL  DEFAULT '09:00:00',
    `close_time`  TIME            NOT NULL  DEFAULT '17:00:00',
    `is_active`   BOOLEAN         NOT NULL  DEFAULT TRUE,
    `created_at`  TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reading_rooms_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `seat_bookings` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`       CHAR(36)        NOT NULL,
    `room_id`       BIGINT UNSIGNED NOT NULL,
    `seat_number`   INT UNSIGNED    NOT NULL,
    `booking_date`  DATE            NOT NULL,
    `slot`          ENUM('MORNING','AFTERNOON','FULL_DAY')
                                    NOT NULL  DEFAULT 'FULL_DAY',
    `start_time`    TIME            DEFAULT NULL,
    `end_time`      TIME            DEFAULT NULL,
    `status`        ENUM('CONFIRMED','CHECKED_IN','CANCELLED','COMPLETED')
                                    NOT NULL  DEFAULT 'CONFIRMED',
    `created_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_seat_bookings_slot` (`room_id`, `seat_number`, `booking_date`, `slot`),
    INDEX `idx_seat_bookings_user` (`user_id`),
    INDEX `idx_seat_bookings_date_room` (`booking_date`, `room_id`),
    INDEX `idx_seat_bookings_status` (`status`),
    CONSTRAINT `fk_seat_bookings_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_seat_bookings_room`
        FOREIGN KEY (`room_id`) REFERENCES `reading_rooms` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`       CHAR(36)        DEFAULT NULL  COMMENT 'NULL for system actions',
    `action`        VARCHAR(100)    NOT NULL  COMMENT 'e.g. CHECKOUT, RETURN, CREATE, DELETE',
    `entity_type`   VARCHAR(50)     DEFAULT NULL  COMMENT 'e.g. BOOK, LOAN, USER',
    `entity_id`     BIGINT UNSIGNED DEFAULT NULL,
    `old_value`     JSON            DEFAULT NULL,
    `new_value`     JSON            DEFAULT NULL,
    `description`   TEXT            DEFAULT NULL,
    `ip_address`    VARCHAR(45)     DEFAULT NULL  COMMENT 'IPv4 or IPv6',
    `created_at`    TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_logs_user` (`user_id`),
    INDEX `idx_audit_logs_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_logs_action` (`action`),
    INDEX `idx_audit_logs_created` (`created_at`),
    CONSTRAINT `fk_audit_logs_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- STEP 6: VIEWS, STORED PROCEDURES & TRIGGERS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- VIEW: vw_overdue_loans
-- Shows all currently overdue loans with days overdue and estimated fine (₹2/day)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_overdue_loans` AS
SELECT
    l.id              AS loan_id,
    l.user_id,
    u.name            AS user_name,
    u.email           AS user_email,
    u.phone           AS user_phone,
    bc.id             AS copy_id,
    bc.barcode,
    b.id              AS book_id,
    b.title           AS book_title,
    b.author          AS book_author,
    b.isbn,
    l.issue_date,
    l.due_date,
    DATEDIFF(NOW(), l.due_date)            AS days_overdue,
    CAST(DATEDIFF(NOW(), l.due_date) * 2.00 AS DECIMAL(8,2))  AS estimated_fine,
    COALESCE(f.amount, 0)                  AS current_fine,
    COALESCE(f.is_paid, FALSE)             AS fine_paid,
    l.renewal_count,
    l.status
FROM `loans` l
    JOIN `users` u          ON u.id = l.user_id
    JOIN `book_copies` bc   ON bc.id = l.book_copy_id
    JOIN `books` b          ON b.id = bc.book_id
    LEFT JOIN `fines` f     ON f.loan_id = l.id
WHERE l.status IN ('ACTIVE', 'OVERDUE')
  AND l.due_date < NOW()
  AND l.return_date IS NULL
ORDER BY days_overdue DESC;


-- ---------------------------------------------------------------------------
-- VIEW: vw_book_availability
-- Shows each book with total copies, available copies, active reservations
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_book_availability` AS
SELECT
    b.id              AS book_id,
    b.isbn,
    b.title,
    b.author,
    b.genre,
    b.total_copies,
    b.available_copies,
    (b.total_copies - b.available_copies)  AS checked_out_copies,
    COALESCE(r.active_reservations, 0)     AS active_reservations,
    b.reference_only,
    CASE
        WHEN b.available_copies > 0 AND b.reference_only = FALSE THEN 'AVAILABLE'
        WHEN b.available_copies > 0 AND b.reference_only = TRUE  THEN 'REFERENCE_ONLY'
        WHEN COALESCE(r.active_reservations, 0) > 0              THEN 'RESERVED'
        ELSE 'UNAVAILABLE'
    END AS availability_status
FROM `books` b
LEFT JOIN (
    SELECT book_id, COUNT(*) AS active_reservations
    FROM `reservations`
    WHERE status IN ('PENDING', 'READY')
    GROUP BY book_id
) r ON r.book_id = b.id
ORDER BY b.title;


-- ---------------------------------------------------------------------------
-- VIEW: vw_user_summary
-- Quick member stats for admin dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_user_summary` AS
SELECT
    u.id               AS user_id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    u.created_at,
    COALESCE(al.active_loans, 0)   AS active_loans,
    COALESCE(al.total_loans, 0)    AS total_loans,
    COALESCE(uf.unpaid_fines, 0)   AS unpaid_fine_amount,
    m.type             AS membership_type,
    m.end_date         AS membership_expires
FROM `users` u
LEFT JOIN (
    SELECT user_id,
           SUM(CASE WHEN status IN ('ACTIVE','OVERDUE') THEN 1 ELSE 0 END) AS active_loans,
           COUNT(*)  AS total_loans
    FROM `loans`
    GROUP BY user_id
) al ON al.user_id = u.id
LEFT JOIN (
    SELECT user_id, SUM(amount) AS unpaid_fines
    FROM `fines`
    WHERE is_paid = FALSE
    GROUP BY user_id
) uf ON uf.user_id = u.id
LEFT JOIN `memberships` m ON m.user_id = u.id AND m.is_active = TRUE
ORDER BY u.name;


-- ---------------------------------------------------------------------------
-- PROCEDURE: sp_calculate_fines
-- Calculates and upserts fines for all overdue loans (₹2 per day)
-- ---------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE `sp_calculate_fines` ()
BEGIN
    DECLARE v_fine_per_day DECIMAL(8,2) DEFAULT 2.00;
    DECLARE v_max_fine     DECIMAL(8,2) DEFAULT 500.00;
    DECLARE v_now          DATETIME     DEFAULT NOW();

    -- Update loan status to OVERDUE for any active loans past due
    UPDATE `loans`
    SET    `status`     = 'OVERDUE',
           `updated_at` = v_now
    WHERE  `status`     = 'ACTIVE'
      AND  `due_date`   < v_now
      AND  `return_date` IS NULL;

    -- Insert or update fines for all overdue loans
    INSERT INTO `fines` (`loan_id`, `user_id`, `amount`, `reason`, `is_paid`, `created_at`)
    SELECT
        l.id,
        l.user_id,
        LEAST(DATEDIFF(v_now, l.due_date) * v_fine_per_day, v_max_fine),
        CONCAT('Overdue fine: ', DATEDIFF(v_now, l.due_date), ' days × ₹', v_fine_per_day, '/day'),
        FALSE,
        v_now
    FROM `loans` l
    WHERE l.status IN ('OVERDUE')
      AND l.return_date IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM `fines` f WHERE f.loan_id = l.id AND f.is_paid = FALSE
      )
    ON DUPLICATE KEY UPDATE
        `amount` = LEAST(DATEDIFF(v_now, l.due_date) * v_fine_per_day, v_max_fine),
        `reason` = CONCAT('Overdue fine: ', DATEDIFF(v_now, l.due_date), ' days × ₹', v_fine_per_day, '/day');

    -- Update existing unpaid fines with recalculated amounts
    UPDATE `fines` f
    JOIN `loans` l ON l.id = f.loan_id
    SET f.amount = LEAST(DATEDIFF(v_now, l.due_date) * v_fine_per_day, v_max_fine),
        f.reason = CONCAT('Overdue fine: ', DATEDIFF(v_now, l.due_date), ' days × ₹', v_fine_per_day, '/day')
    WHERE f.is_paid = FALSE
      AND l.status = 'OVERDUE'
      AND l.return_date IS NULL;

    -- Generate notifications for newly overdue loans
    INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `reference_id`, `reference_type`)
    SELECT
        l.user_id,
        'Overdue Notice',
        CONCAT('Your loan for "', b.title, '" is overdue by ', DATEDIFF(v_now, l.due_date), ' days. Fine: ₹', LEAST(DATEDIFF(v_now, l.due_date) * v_fine_per_day, v_max_fine)),
        'OVERDUE',
        l.id,
        'LOAN'
    FROM `loans` l
    JOIN `book_copies` bc ON bc.id = l.book_copy_id
    JOIN `books` b ON b.id = bc.book_id
    WHERE l.status = 'OVERDUE'
      AND l.return_date IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM `notifications` n
          WHERE n.reference_id = l.id
            AND n.reference_type = 'LOAN'
            AND n.type = 'OVERDUE'
            AND DATE(n.created_at) = CURDATE()
      );
END //

DELIMITER ;


-- ---------------------------------------------------------------------------
-- PROCEDURE: sp_expire_reservations
-- Expires old reservations and re-orders queue positions
-- ---------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE `sp_expire_reservations` ()
BEGIN
    DECLARE v_now DATETIME DEFAULT NOW();

    -- 1. Mark expired reservations
    UPDATE `reservations`
    SET    `status`     = 'EXPIRED',
           `updated_at` = v_now
    WHERE  `status`     IN ('PENDING', 'READY')
      AND  `expires_at` IS NOT NULL
      AND  `expires_at` < v_now;

    -- 2. Recalculate queue positions for each book
    UPDATE `reservations` r
    JOIN (
        SELECT
            id,
            book_id,
            ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY reserved_at ASC) AS new_pos
        FROM `reservations`
        WHERE status = 'PENDING'
    ) ranked ON ranked.id = r.id
    SET r.queue_position = ranked.new_pos,
        r.updated_at     = v_now
    WHERE r.queue_position != ranked.new_pos;

    -- 3. Promote position-1 reservations to READY if a copy is available
    UPDATE `reservations` r
    JOIN `books` b ON b.id = r.book_id
    SET    r.status     = 'READY',
           r.expires_at = DATE_ADD(v_now, INTERVAL 3 DAY),
           r.updated_at = v_now
    WHERE  r.status         = 'PENDING'
      AND  r.queue_position = 1
      AND  b.available_copies > 0;

    -- 4. Notify users whose reservations are now READY
    INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `reference_id`, `reference_type`)
    SELECT
        r.user_id,
        'Reservation Ready!',
        CONCAT('Your reservation for "', b.title, '" is ready for pickup. Expires in 3 days.'),
        'RESERVATION_READY',
        r.id,
        'RESERVATION'
    FROM `reservations` r
    JOIN `books` b ON b.id = r.book_id
    WHERE r.status = 'READY'
      AND NOT EXISTS (
          SELECT 1 FROM `notifications` n
          WHERE n.reference_id = r.id
            AND n.reference_type = 'RESERVATION'
            AND n.type = 'RESERVATION_READY'
      );
END //

DELIMITER ;


-- ---------------------------------------------------------------------------
-- PROCEDURE: sp_due_date_reminders
-- Sends reminders for loans due within the next 2 days
-- ---------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE `sp_due_date_reminders` ()
BEGIN
    INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `reference_id`, `reference_type`)
    SELECT
        l.user_id,
        'Due Date Reminder',
        CONCAT('Your loan for "', b.title, '" is due on ', DATE_FORMAT(l.due_date, '%d %b %Y'), '. Please return or renew it.'),
        'DUE_REMINDER',
        l.id,
        'LOAN'
    FROM `loans` l
    JOIN `book_copies` bc ON bc.id = l.book_copy_id
    JOIN `books` b ON b.id = bc.book_id
    WHERE l.status = 'ACTIVE'
      AND l.return_date IS NULL
      AND l.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
      AND NOT EXISTS (
          SELECT 1 FROM `notifications` n
          WHERE n.reference_id = l.id
            AND n.reference_type = 'LOAN'
            AND n.type = 'DUE_REMINDER'
            AND DATE(n.created_at) = CURDATE()
      );
END //

DELIMITER ;


-- ---------------------------------------------------------------------------
-- TRIGGER: trg_loan_after_insert
-- After a new loan is issued: mark book copy unavailable, decrement available_copies
-- ---------------------------------------------------------------------------
DELIMITER //

CREATE TRIGGER `trg_loan_after_insert`
AFTER INSERT ON `loans`
FOR EACH ROW
BEGIN
    -- Mark the specific copy as unavailable
    UPDATE `book_copies`
    SET    `is_available` = FALSE,
           `updated_at`   = NOW()
    WHERE  `id`           = NEW.book_copy_id;

    -- Decrement available copies on the book
    UPDATE `books`
    SET    `available_copies` = GREATEST(available_copies - 1, 0),
           `updated_at`       = NOW()
    WHERE  `id` = (SELECT `book_id` FROM `book_copies` WHERE `id` = NEW.book_copy_id);

    -- Log the action
    INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `description`)
    VALUES (
        NEW.issued_by,
        'CHECKOUT',
        'LOAN',
        NEW.id,
        CONCAT('Book copy #', NEW.book_copy_id, ' issued to user ', NEW.user_id)
    );
END //

DELIMITER ;


-- ---------------------------------------------------------------------------
-- TRIGGER: trg_loan_after_update
-- After a loan is returned: mark copy available, increment available_copies
-- ---------------------------------------------------------------------------
DELIMITER //

CREATE TRIGGER `trg_loan_after_update`
AFTER UPDATE ON `loans`
FOR EACH ROW
BEGIN
    -- On return (status changed to RETURNED and return_date was set)
    IF NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' AND NEW.return_date IS NOT NULL THEN
        -- Mark the copy available again
        UPDATE `book_copies`
        SET    `is_available` = TRUE,
               `updated_at`   = NOW()
        WHERE  `id`           = NEW.book_copy_id;

        -- Increment available copies
        UPDATE `books`
        SET    `available_copies` = LEAST(available_copies + 1, total_copies),
               `updated_at`       = NOW()
        WHERE  `id` = (SELECT `book_id` FROM `book_copies` WHERE `id` = NEW.book_copy_id);

        -- Log the return
        INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `description`)
        VALUES (
            NEW.user_id,
            'RETURN',
            'LOAN',
            NEW.id,
            CONCAT('Book copy #', NEW.book_copy_id, ' returned by user ', NEW.user_id)
        );

        -- Increment reading goal if applicable
        UPDATE `reading_goals`
        SET    `completed_count` = completed_count + 1,
               `updated_at`      = NOW()
        WHERE  `user_id` = NEW.user_id
          AND  `year`    = YEAR(NOW())
          AND  `status`  = 'IN_PROGRESS';
    END IF;

    -- On lost (status changed to LOST)
    IF NEW.status = 'LOST' AND OLD.status != 'LOST' THEN
        -- Mark copy condition as LOST
        UPDATE `book_copies`
        SET    `condition`    = 'LOST',
               `is_available` = FALSE,
               `updated_at`   = NOW()
        WHERE  `id`           = NEW.book_copy_id;

        -- Decrement total copies
        UPDATE `books`
        SET    `total_copies` = GREATEST(total_copies - 1, 0),
               `updated_at`   = NOW()
        WHERE  `id` = (SELECT `book_id` FROM `book_copies` WHERE `id` = NEW.book_copy_id);

        INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `description`)
        VALUES (
            NEW.user_id,
            'LOST',
            'LOAN',
            NEW.id,
            CONCAT('Book copy #', NEW.book_copy_id, ' marked LOST for user ', NEW.user_id)
        );
    END IF;
END //

DELIMITER ;


-- ============================================================================
-- SEED DATA: Reading Rooms
-- ============================================================================

INSERT INTO `reading_rooms` (`name`, `floor`, `total_seats`, `open_time`, `close_time`) VALUES
    ('Main Reading Hall',    'Ground', 50,  '09:00:00', '21:00:00'),
    ('Silent Study Room',    '1st',    20,  '09:00:00', '17:00:00'),
    ('Group Discussion Room','1st',    15,  '09:00:00', '17:00:00'),
    ('Digital Library Lab',  '2nd',    30,  '10:00:00', '18:00:00'),
    ('Periodicals Section',  'Ground', 12,  '09:00:00', '17:00:00');


-- ============================================================================
-- SEED DATA: Default Categories
-- ============================================================================

INSERT INTO `categories` (`name`, `parent_id`, `description`) VALUES
    ('Competitive Exam', NULL, 'Books for UPSC, SSC, Banking, JEE, NEET and other competitive exams'),
    ('College',          NULL, 'Undergraduate and postgraduate textbooks'),
    ('School',           NULL, 'CBSE, ICSE, State Board textbooks and reference books'),
    ('Comics',           NULL, 'Graphic novels, manga, and comic books'),
    ('History',          NULL, 'World history, Indian history, and historical biographies'),
    ('Non-Fiction',      NULL, 'Science, technology, self-help, business, and reference'),
    ('Fiction',          NULL, 'Novels, short stories, poetry, and drama'),
    ('Other',            NULL, 'Miscellaneous books and periodicals');

-- Sub-categories for Competitive Exam
INSERT INTO `categories` (`name`, `parent_id`, `description`)
SELECT sub.name, c.id, sub.description
FROM `categories` c
CROSS JOIN (
    SELECT 'UPSC' AS name, 'UPSC Civil Services preparation' AS description UNION ALL
    SELECT 'SSC',  'SSC CGL, CHSL, MTS preparation' UNION ALL
    SELECT 'Banking', 'IBPS, SBI, RBI exam preparation' UNION ALL
    SELECT 'JEE',  'JEE Main & Advanced preparation' UNION ALL
    SELECT 'NEET', 'NEET UG & PG medical entrance' UNION ALL
    SELECT 'GATE', 'GATE engineering entrance preparation'
) sub
WHERE c.name = 'Competitive Exam' AND c.parent_id IS NULL;

-- Sub-categories for College
INSERT INTO `categories` (`name`, `parent_id`, `description`)
SELECT sub.name, c.id, sub.description
FROM `categories` c
CROSS JOIN (
    SELECT 'Engineering' AS name, 'B.Tech / B.E. subjects' AS description UNION ALL
    SELECT 'Medical',    'MBBS, BDS, Nursing subjects' UNION ALL
    SELECT 'Commerce',   'B.Com, MBA, CA preparation' UNION ALL
    SELECT 'Arts',       'BA, MA in humanities and social sciences' UNION ALL
    SELECT 'Science',    'B.Sc, M.Sc subjects'
) sub
WHERE c.name = 'College' AND c.parent_id IS NULL;

-- Sub-categories for Fiction
INSERT INTO `categories` (`name`, `parent_id`, `description`)
SELECT sub.name, c.id, sub.description
FROM `categories` c
CROSS JOIN (
    SELECT 'Literary Fiction' AS name, 'Classic and contemporary literary works' AS description UNION ALL
    SELECT 'Thriller',        'Mystery, crime, and suspense' UNION ALL
    SELECT 'Fantasy',         'Fantasy and magical realism' UNION ALL
    SELECT 'Science Fiction', 'Sci-fi and speculative fiction' UNION ALL
    SELECT 'Romance',         'Romance and love stories' UNION ALL
    SELECT 'Horror',          'Horror and supernatural fiction'
) sub
WHERE c.name = 'Fiction' AND c.parent_id IS NULL;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

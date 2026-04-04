# LibraryMS - Library Management System

## Overview

Full-stack Library Management System with a Java Spring Boot backend and React + Vite frontend, built in a pnpm monorepo.

## Architecture

### Backend (Java Spring Boot)
- **Location**: `lms-backend/`
- **Framework**: Spring Boot 3.2.5 with Java 19 (GraalVM 22.3)
- **Port**: 8080, Context Path: `/api`
- **Database**: PostgreSQL (auto-created via Hibernate DDL)
- **Auth**: JWT (Spring Security + JwtUtil)
- **JAR**: `lms-backend/target/library-management-system-1.0.0.jar`

### Frontend (React + Vite)
- **Location**: `artifacts/lms/`
- **Port**: 22419 (dev), served at path `/`
- **State**: TanStack Query v5 + Wouter routing
- **UI**: Tailwind CSS + Shadcn UI components
- **API Client**: Auto-generated from OpenAPI spec (`lib/api-client-react/`)

### API Spec
- **Location**: `lib/api-spec/openapi.yaml`
- **Codegen**: Orval → `lib/api-client-react/src/generated/`
- After changing the spec, run: `pnpm --filter @workspace/api-spec run codegen`
- After codegen, rebuild types: `pnpm --filter @workspace/api-client-react exec tsc --build`

## Features

### User Roles (6)
1. **Admin** (`ROLE_ADMIN`) — full access including user management, all reports
2. **Librarian** (`ROLE_LIBRARIAN`) — checkout/return books, manage loans/reservations
3. **Faculty** (`ROLE_FACULTY`) — borrow 10 books / 30 days / 2 renewals, fine waived <7 days
4. **College Student** (`ROLE_COLLEGE_STUDENT`) — borrow 5 books / 21 days / 1 renewal
5. **School Student** (`ROLE_SCHOOL_STUDENT`) — borrow 3 books / 14 days / 1 renewal, no reference books
6. **General Patron** (`ROLE_GENERAL_PATRON`) — borrow 4 books / 21 days / 1 renewal

### Book Categories (8 with subcategories)
- **Competitive Exams**: SSC, UPSC, CAT, GATE, NEET, JEE, BANKING, RAILWAY
- **College**: Engineering, Medical, Law, Arts, Commerce, Management, Science, Other
- **School**: Grade 1–5, 6–8, 9–10, 11–12
- **Comic**: Superhero, Manga, Graphic Novel, Webcomic, Other
- **History**: Ancient, Medieval, Modern, Indian History, World History
- **Non-Fiction**: Science, Technology, Business, Self-Help, Biography, Travel, Other
- **Fiction**: Literary, Mystery, Thriller, Romance, Sci-Fi, Fantasy, Horror, Historical
- **Other**: Newspaper, Magazine, Journal, Reference, Other

### Business Rules
- Fine: $0.50/day, max $50; faculty waived if <7 days overdue
- Outstanding fines >$10 block new checkouts
- School students cannot borrow reference-only books
- Reservation queue management with auto-notify
- Audit logging for all checkout/return events

## Default Credentials (seeded)
| Role | Email | Password |
|------|-------|---------|
| Admin | admin@library.com | Admin@123 |
| Librarian | librarian@library.com | Lib@123 |
| Faculty | faculty@library.com | Faculty@123 |
| College Student | college@library.com | Student@123 |
| School Student | school@library.com | Student@123 |
| General Patron | patron@library.com | Patron@123 |

## Building the Backend

```bash
cd lms-backend && mvn package -DskipTests -q
```

## Running Workflows
- **API Server**: Runs the Java Spring Boot JAR
- **LMS Web**: Runs the Vite dev server

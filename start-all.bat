@echo off
echo Starting Library Management System...
start "LMS Backend" cmd /k "cd /d "%~dp0lms-backend" && mvn spring-boot:run"
start "LMS Frontend" cmd /k "cd /d "%~dp0frontend" && pnpm install && pnpm dev"
echo Both services are starting in new windows.

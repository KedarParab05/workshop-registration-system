@echo off
title Kaushalya - Master Launcher
cd /d "%~dp0"

echo ========================================================
echo  Launching Kaushalya (Backend + Frontend)
echo ========================================================

start "Kaushalya Backend (Spring Boot: 8080)" cmd /k call start-backend.bat
timeout /t 3 /nobreak >nul
start "Kaushalya Frontend (Vite: 3000)" cmd /k call start-frontend.bat

echo Both services launched in separate windows!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000

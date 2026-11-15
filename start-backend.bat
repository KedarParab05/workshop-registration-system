@echo off
title Kaushalya - Backend (Spring Boot)
cd /d "%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ========================================================
echo  Starting Kaushalya Backend (Spring Boot on Port 8080)
echo ========================================================
echo Loading environment variables from .env...

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if not "%%A"=="" (
        set "%%A=%%B"
    )
)

call mvnw.cmd spring-boot:run
pause

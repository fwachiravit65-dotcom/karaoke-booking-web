@echo off
title [1] Local Test Server - NEON BEAT KARAOKE
color 0B

cd /d "%~dp0"

echo ========================================================
echo   [1] NEON BEAT KARAOKE - LOCAL TEST SERVER
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 goto INSTALL_NODE

if not exist "node_modules\" (
    echo [*] Installing dependencies for the first time...
    call npm install
)

echo [*] Opening test website at http://localhost:3000 ...
start "" "http://localhost:3000"

echo [*] Local server is running...
echo     (You can minimize this window while testing)
echo.
call npm run dev
pause
exit /b

:INSTALL_NODE
color 0E
echo [!] Node.js is not installed on this computer yet.
echo [*] Installing Node.js LTS automatically...
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
echo.
echo [OK] Node.js installation finished!
echo Please close this window and double-click 1-Test-Web.bat again.
pause
exit /b

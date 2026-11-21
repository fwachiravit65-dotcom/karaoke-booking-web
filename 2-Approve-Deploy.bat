@echo off
title [2] Approve and Deploy to Production - NEON BEAT KARAOKE
color 0A

cd /d "%~dp0"

echo ========================================================
echo   [2] VERIFY AND APPROVE DEPLOY TO LIVE WEBSITE
echo ========================================================
echo.

echo [Step 1/3] Checking modified files...
git status -s
echo.

where node >nul 2>nul
if %errorlevel% neq 0 goto SKIP_LOCAL_BUILD

echo [Step 2/3] Checking for errors (npm run build)...
if not exist "node_modules\" (
    call npm install
)
call npm run build
if %errorlevel% neq 0 goto BUILD_FAILED

echo.
echo [OK] Build check PASSED 100%% - No errors found!
goto ASK_APPROVAL

:SKIP_LOCAL_BUILD
echo [Step 2/3] Skipping local build check (Node.js not in PATH).
echo            Vercel Cloud will verify the build automatically.

:ASK_APPROVAL
echo.
echo ========================================================
echo   [Step 3/3] CONFIRM APPROVAL TO DEPLOY
echo   Target: https://karaoke-booking-web.vercel.app/
echo ========================================================
set "confirm="
set /p confirm="Type Y and press Enter to APPROVE deploy (or N to cancel): "

if /i not "%confirm%"=="Y" goto CANCELLED

echo.
set "note="
set /p note="Enter short update note (or press Enter to skip): "
if "%note%"=="" set "note=Approved update to production"

echo.
echo [*] Deploying update to GitHub and Vercel...
git add .
git commit -m "%note%"
git push origin main

if %errorlevel% neq 0 goto PUSH_FAILED

color 0A
echo.
echo ========================================================
echo   [SUCCESS] DEPLOY APPROVED AND SENT TO VERCEL!
echo   Your live website will update in ~45 seconds:
echo   https://karaoke-booking-web.vercel.app/
echo ========================================================
start "" "https://karaoke-booking-web.vercel.app/"
pause
exit /b

:BUILD_FAILED
color 0C
echo.
echo ========================================================
echo   [ERROR] Code verification FAILED!
echo   Deployment blocked to protect your live website.
echo   Please fix the errors shown above and try again.
echo ========================================================
pause
exit /b

:PUSH_FAILED
color 0C
echo.
echo [!] Failed to push to GitHub. Please check your internet or login.
pause
exit /b

:CANCELLED
echo.
echo [Cancelled] Deployment was not approved.
pause
exit /b

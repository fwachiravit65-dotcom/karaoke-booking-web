@echo off
chcp 65001 >nul
title [1] ทดสอบเว็บไซต์ร้านคาราโอเกะ (Local Test Server)
color 0B

cd /d "%~dp0"

echo ========================================================
echo   🎤 ระบบทดสอบเว็บไซต์ NEON BEAT KARAOKE (โหมดทดสอบ)
echo ========================================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] ยังไม่ได้ติดตั้ง Node.js ในเครื่องนี้
    echo กำลังติดตั้ง Node.js ให้อัตโนมัติ กรุณารอสักครู่...
    winget install OpenJS.NodeJS.LTS
    echo.
    echo ติดตั้งเสร็จแล้ว กรุณาปิดหน้าต่างนี้แล้วดับเบิลคลิกใหม่อีกครั้งครับ
    pause
    exit /b
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [*] กำลังเตรียมระบบครั้งแรก (npm install)...
    call npm install
)

echo [*] กำลังเปิดหน้าเว็บทดสอบที่ http://localhost:3000 ...
start "" "http://localhost:3000"

echo [*] เซิร์ฟเวอร์ทดสอบกำลังทำงาน (ย่อหน้าต่างนี้ไว้ได้ ห้ามกดปิดจนกว่าจะเลิกทดสอบ)
echo.
call npm run dev

pause

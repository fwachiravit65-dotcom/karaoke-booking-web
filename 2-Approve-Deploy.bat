@echo off
chcp 65001 >nul
title [2] ตรวจสอบและอนุมัติอัปเดตขึ้นเว็บจริง (Approve & Deploy)
color 0A

cd /d "%~dp0"

echo ========================================================
echo   🚀 ระบบตรวจสอบความถูกต้อง และอนุมัติขึ้นเว็บจริง (Deploy)
echo ========================================================
echo.

:: Step 1: Check if there are any changes
echo [ขั้นตอนที่ 1/3] ตรวจสอบรายการไฟล์ที่มีการแก้ไข...
git status -s
echo.

:: Step 2: Run build test if Node is installed
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [ขั้นตอนที่ 2/3] กำลังตรวจสอบโค้ดว่ามี Error หรือไม่ (npm run build)...
    if not exist "node_modules\" (
        call npm install
    )
    call npm run build
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ========================================================
        echo   ❌ พบข้อผิดพลาด (Error) ในโค้ด!
        echo   ระบบระงับการอัปเดตขึ้นเว็บจริง เพื่อป้องกันเว็บล่ม
        echo   กรุณาแก้ไขจุดที่แจ้งเตือนสีแดงด้านบนก่อนลองใหม่อีกครั้ง
        echo ========================================================
        pause
        exit /b
    )
    echo.
    echo   ✅ ตรวจสอบผ่าน 100%% ไม่พบ Error ในระบบ!
) else (
    echo [!] ข้ามการตรวจ Build ในเครื่อง (เนื่องจากยังไม่ได้ลง Node.js)
    echo     Vercel จะทำหน้าที่ตรวจเช็คความถูกต้องให้อีกชั้นบนคลาวด์
)

echo.
echo ========================================================
echo   [ขั้นตอนที่ 3/3] ยืนยันการอนุมัติ Deploy ขึ้นเว็บจริง
echo ========================================================
set /p confirm="พิมพ์ Y แล้วกด Enter เพื่ออนุมัติอัปเดตขึ้นเว็บจริง (หรือกดปุ่มอื่นเพื่อยกเลิก): "

if /i "%confirm%" neq "Y" (
    echo.
    echo [ยกเลิก] ยังไม่ได้ส่งโค้ดขึ้นเว็บจริง
    pause
    exit /b
)

echo.
set /p note="ระบุหมายเหตุสั้นๆ (หรือกด Enter ข้ามได้เลย): "
if "%note%"=="" set note=Approved update to production

echo.
echo [*] กำลังส่งข้อมูลอัปเดตขึ้นเว็บจริง...
git add .
git commit -m "%note%"
git push origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ========================================================
    echo   🎉 อนุมัติและส่งขึ้นระบบสำเร็จเรียบร้อย!
    echo   รอประมาณ 45-60 วินาที เว็บจริงจะอัปเดตอัตโนมัติที่:
    echo   https://karaoke-booking-web.vercel.app/
    echo ========================================================
    start "" "https://karaoke-booking-web.vercel.app/"
) else (
    color 0C
    echo.
    echo [!] เกิดข้อผิดพลาดในการส่งโค้ดขึ้น GitHub กรุณาตรวจสอบอินเทอร์เน็ต
)

pause

-- ========================================================
-- MOOD.KARAOKE (ROI ET 1) - SUPABASE CLOUD DATABASE SCHEMA
-- ========================================================
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของเว็บ Supabase แล้วกดปุ่ม Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ตารางเก็บข้อมูลบัญชีสมาชิกและพนักงาน (Members & Promoted Staff)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    pin VARCHAR(10) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER', -- 'CUSTOMER' หรือ 'STAFF'
    staff_title VARCHAR(100),
    promoted_at TIMESTAMPTZ,
    total_hours_accumulated INT NOT NULL DEFAULT 1,
    free_hours_available INT NOT NULL DEFAULT 0,
    login_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตารางเก็บข้อมูลการจองห้อง (Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(40) UNIQUE NOT NULL,
    room_id VARCHAR(20) NOT NULL, -- 'R1' ถึง 'R11'
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    booking_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    total_hours INT NOT NULL,
    room_charge NUMERIC(10, 2) NOT NULL,
    package_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'
    slip_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดสิทธิ์ให้เว็บอ่านและบันทึกข้อมูลผ่าน API ได้
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public readwrite members" ON public.members;
CREATE POLICY "Allow public readwrite members" ON public.members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public readwrite bookings" ON public.bookings;
CREATE POLICY "Allow public readwrite bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

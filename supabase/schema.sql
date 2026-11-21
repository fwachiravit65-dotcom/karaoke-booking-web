-- ========================================================
-- KARAOKE ROOM BOOKING - SUPABASE DATABASE SCHEMA
-- ========================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'STANDARD_S', -- 'STANDARD_S', 'STANDARD_M', 'PARTY_L', 'VIP_LUXURY'
    capacity_min INT NOT NULL DEFAULT 2,
    capacity_max INT NOT NULL DEFAULT 6,
    price_per_hour NUMERIC(10, 2) NOT NULL,
    description TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Package Addons (Buffet drink / snacks / party props)
CREATE TABLE IF NOT EXISTS public.package_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    booking_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- e.g. '18:00'
    end_time VARCHAR(10) NOT NULL,   -- e.g. '21:00'
    total_hours INT NOT NULL,
    room_charge NUMERIC(10, 2) NOT NULL,
    package_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'
    slip_image_url TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy conflict checking
CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check 
ON public.bookings(room_id, booking_date, status);

-- 5. Atomic Double-Booking Prevention Function (Transaction Safe)
-- This function checks if a room is already taken on that date/time slot with locking.
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_room_id UUID,
    p_customer_name VARCHAR,
    p_customer_phone VARCHAR,
    p_customer_email VARCHAR,
    p_booking_date DATE,
    p_start_time VARCHAR,
    p_end_time VARCHAR,
    p_total_hours INT,
    p_room_charge NUMERIC,
    p_package_charge NUMERIC,
    p_total_amount NUMERIC,
    p_deposit_amount NUMERIC,
    p_slip_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflict_count INT;
    v_booking_code VARCHAR;
    v_new_booking_id UUID;
    v_room_exists BOOLEAN;
BEGIN
    -- 1. Check if room exists and is active
    SELECT EXISTS(SELECT 1 FROM public.rooms WHERE id = p_room_id AND is_active = TRUE) INTO v_room_exists;
    IF NOT v_room_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'ห้องนี้ไม่พร้อมให้บริการ');
    END IF;

    -- 2. Acquire lock for this specific room on this date to prevent concurrent race condition
    PERFORM pg_advisory_xact_lock(hashtext(p_room_id::text || p_booking_date::text));

    -- 3. Check for overlapping reservations (only active ones: PENDING or CONFIRMED)
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE room_id = p_room_id
      AND booking_date = p_booking_date
      AND status IN ('PENDING', 'CONFIRMED')
      AND (
          (start_time < p_end_time AND end_time > p_start_time)
      );

    IF v_conflict_count > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'ขออภัย ห้องนี้มีผู้จองในช่วงเวลาดังกล่าวแล้ว');
    END IF;

    -- 4. Generate unique readable booking code (e.g. KB-YYYYMMDD-XXXX)
    v_booking_code := 'KB-' || to_char(p_booking_date, 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 5));

    -- 5. Insert new booking safely
    INSERT INTO public.bookings (
        booking_code,
        room_id,
        customer_name,
        customer_phone,
        customer_email,
        booking_date,
        start_time,
        end_time,
        total_hours,
        room_charge,
        package_charge,
        total_amount,
        deposit_amount,
        status,
        slip_image_url
    ) VALUES (
        v_booking_code,
        p_room_id,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_booking_date,
        p_start_time,
        p_end_time,
        p_total_hours,
        p_room_charge,
        p_package_charge,
        p_total_amount,
        p_deposit_amount,
        'PENDING',
        p_slip_url
    ) RETURNING id INTO v_new_booking_id;

    RETURN jsonb_build_object(
        'success', true, 
        'booking_id', v_new_booking_id,
        'booking_code', v_booking_code,
        'message', 'จองห้องสำเร็จ รอพนักงานตรวจสอบสลิป'
    );
END;
$$;

-- 6. Insert Initial Seed Data (Demo Rooms & Addon Packages)
INSERT INTO public.rooms (room_number, name, type, capacity_min, capacity_max, price_per_hour, description, features, image_url)
VALUES
('R101', 'Room Neon Cozy', 'STANDARD_S', 2, 4, 250.00, 'ห้องขนาดกะทัดรัด เหมาะสำหรับคู่รักหรือกลุ่มเพื่อน 2-4 คน ระบบเสียง JBL ชัดใส', ARRAY['Smart TV 55 นิ้ว', 'ไมโครโฟนไร้สาย 2 ตัว', 'ไฟนีออนปรับสีได้'], 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop'),
('R102', 'Room Retro Pop', 'STANDARD_M', 5, 8, 400.00, 'ห้องขนาดกลาง สไตล์เรโทร เหมาะกับการปาร์ตี้เพื่อนสนิท ร้องเพลงเต้นมันส์ๆ', ARRAY['Smart TV 65 นิ้ว', 'ไมค์ไร้สาย 4 ตัว', 'ระบบเสียง Soundbar ซับวูฟเฟอร์', 'โต๊ะวางอาหารขนาดใหญ่'], 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop'),
('R201', 'Room Party Glow', 'PARTY_L', 9, 15, 650.00, 'ห้องปาร์ตี้ขนาดใหญ่ พร้อมเวทีมินิ แสงเลเซอร์ และเพลงอัปเดตสากล/ไทย/เกาหลีครบครัน', ARRAY['หน้าจอโปรเจกเตอร์ 100 นิ้ว', 'ไมค์ 6 ตัว', 'ไฟเลเซอร์ปาร์ตี้ Disco', 'โซฟารูปตัว U'], 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop'),
('R301', 'Penthouse VIP Club', 'VIP_LUXURY', 15, 25, 1200.00, 'ห้องวีไอพีสุดหรู ห้องน้ำในตัว เคาน์เตอร์บาร์ส่วนตัว และระบบเครื่องเสียงระดับคอนเสิร์ต', ARRAY['จอ LED Wall 150 นิ้ว', 'ห้องน้ำส่วนตัวในห้อง', 'เคาน์เตอร์บาร์พร้อมตู้แช่', 'โซนรับประทานอาหารแยก'], 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop')
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO public.package_addons (name, description, price)
VALUES
('Buffet เครื่องดื่ม Soft Drink (ต่อท่าน)', 'น้ำอัดลม ชาเขียว น้ำเปล่า ไม่อั้นตลอดเวลาที่ร้อง', 89.00),
('Party Combo Snack Set', 'เฟรนช์ฟรายส์ ไก่ทอดเกาหลี นักเก็ต ป๊อปคอร์นถังยักษ์', 299.00),
('Set เค้กวันเกิด & พร็อพปาร์ตี้', 'เค้กช็อกโกแลตฟัดจ์ หมวกปาร์ตี้ ป้ายไฟ HBD', 390.00)
ON CONFLICT DO NOTHING;

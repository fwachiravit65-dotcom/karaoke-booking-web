-- ========================================================
-- MOOD KARAOKE STUDIO - SUPABASE DATABASE SCHEMA
-- ========================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Members Table (Phone ID + 6-Digit PIN + Loyalty Hours)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    total_hours_accumulated INT NOT NULL DEFAULT 0,
    free_hours_available INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'STANDARD_S',
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

-- 4. Create Package Addons
CREATE TABLE IF NOT EXISTS public.package_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
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
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    slip_image_url TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check 
ON public.bookings(room_id, booking_date, status);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone 
ON public.bookings(customer_phone);

-- 6. Atomic Double-Booking Prevention Function
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
    SELECT EXISTS(SELECT 1 FROM public.rooms WHERE id = p_room_id AND is_active = TRUE) INTO v_room_exists;
    IF NOT v_room_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'ห้องนี้ไม่พร้อมให้บริการ');
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext(p_room_id::text || p_booking_date::text));

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

    v_booking_code := 'MD-' || to_char(p_booking_date, 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

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

    -- Automatically credit loyalty hours if phone matches a registered member
    UPDATE public.members
    SET total_hours_accumulated = total_hours_accumulated + p_total_hours,
        updated_at = NOW()
    WHERE phone = p_customer_phone;

    RETURN jsonb_build_object(
        'success', true, 
        'booking_id', v_new_booking_id,
        'booking_code', v_booking_code,
        'message', 'จองห้องสำเร็จ รอพนักงานตรวจสอบสลิป'
    );
END;
$$;

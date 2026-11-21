import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      roomId,
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      startTime,
      endTime,
      totalHours,
      roomCharge,
      packageCharge,
      totalAmount,
      depositAmount,
      slipImageUrl,
    } = body;

    // Validation
    if (!roomId || !customerName || !customerPhone || !bookingDate || !startTime) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // 1. If Supabase is connected, call the atomic function that has row locking
    if (supabase) {
      const { data, error } = await supabase.rpc('create_booking_atomic', {
        p_room_id: roomId,
        p_customer_name: customerName,
        p_customer_phone: customerPhone,
        p_customer_email: customerEmail || null,
        p_booking_date: bookingDate,
        p_start_time: startTime,
        p_end_time: endTime,
        p_total_hours: totalHours,
        p_room_charge: roomCharge,
        p_package_charge: packageCharge || 0,
        p_total_amount: totalAmount,
        p_deposit_amount: depositAmount,
        p_slip_url: slipImageUrl || null,
      });

      if (error) {
        console.error('Supabase atomic booking error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      if (!data.success) {
        // Return 409 Conflict if room is already taken
        return NextResponse.json(data, { status: 409 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    // 2. Simulated response for offline/preview testing
    const fakeBookingCode = `KB-${bookingDate.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      bookingCode: fakeBookingCode,
      message: 'บันทึกการจองสำเร็จ (โหมดทดสอบ)',
    });
  } catch (err: any) {
    console.error('Booking API error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}

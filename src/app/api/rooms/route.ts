import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('room_number', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ success: true, rooms: data });
    }

    // Default mock rooms
    return NextResponse.json({
      success: true,
      rooms: [
        { id: 'room-1', roomNumber: 'R101', name: 'Room Neon Cozy', pricePerHour: 250, capacityMin: 2, capacityMax: 4 },
        { id: 'room-2', roomNumber: 'R102', name: 'Room Retro Pop', pricePerHour: 400, capacityMin: 5, capacityMax: 8 },
        { id: 'room-3', roomNumber: 'R201', name: 'Room Party Glow', pricePerHour: 650, capacityMin: 9, capacityMax: 15 },
        { id: 'room-4', roomNumber: 'R301', name: 'Penthouse VIP Club', pricePerHour: 1200, capacityMin: 15, capacityMax: 25 },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

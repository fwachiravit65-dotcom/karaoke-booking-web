'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, MapPin, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatBaht, getStatusBadge } from '@/lib/utils';
import { Booking } from '@/types';

// Mock bookings for demonstration
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    bookingCode: 'KB-20261122-A8F29',
    roomId: 'room-2',
    customerName: 'คุณสมชาย ใจดี',
    customerPhone: '0812345678',
    customerEmail: 'somchai@example.com',
    bookingDate: '2026-11-22',
    startTime: '19:00',
    endTime: '22:00',
    totalHours: 3,
    roomCharge: 1200,
    packageCharge: 299,
    totalAmount: 1499,
    depositAmount: 750,
    status: 'CONFIRMED',
    slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    createdAt: '2026-11-22T10:00:00Z',
  },
  {
    id: 'b-2',
    bookingCode: 'KB-20261123-B9921',
    roomId: 'room-1',
    customerName: 'คุณสมชาย ใจดี',
    customerPhone: '0812345678',
    bookingDate: '2026-11-23',
    startTime: '18:00',
    endTime: '20:00',
    totalHours: 2,
    roomCharge: 500,
    packageCharge: 0,
    totalAmount: 500,
    depositAmount: 250,
    status: 'PENDING',
    createdAt: '2026-11-22T12:30:00Z',
  },
];

export default function StatusPage() {
  const [searchTerm, setSearchTerm] = useState('0812345678');
  const [hasSearched, setHasSearched] = useState(true);

  const filteredBookings = MOCK_BOOKINGS.filter(
    (b) =>
      b.customerPhone.includes(searchTerm.trim()) ||
      b.bookingCode.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">ตรวจสอบสถานะการจอง</h1>
        <p className="text-slate-400 text-sm mt-1">
          กรอกเบอร์โทรศัพท์ที่ใช้จอง หรือรหัสการจอง เพื่อดูรายละเอียดห้องและสถานะการยืนยัน
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="กรอกเบอร์โทร (เช่น 0812345678) หรือรหัส KB-..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setHasSearched(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition"
          >
            ค้นหาข้อมูล
          </button>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 px-1">
            พบประวัติการจอง {filteredBookings.length} รายการ
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              ไม่พบข้อมูลการจองตามเงื่อนไขที่ระบุ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">รหัสการจอง</span>
                      <span className="text-base font-mono font-bold text-purple-400">
                        {booking.bookingCode}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block mb-0.5">วันและเวลา</span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        {booking.bookingDate} ({booking.startTime} - {booking.endTime} น.)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">ผู้จอง</span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-pink-400" />
                        {booking.customerName} ({booking.customerPhone})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">ยอดมัดจำ / รวม</span>
                      <span className="font-semibold text-amber-400">
                        มัดจำ {formatBaht(booking.depositAmount)} / เต็ม {formatBaht(booking.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                      <span>✓ ห้องได้รับการยืนยันแล้ว สามารถแสดงรหัสนี้ให้พนักงานหน้าร้านเมื่อมาถึงได้เลยครับ</span>
                    </div>
                  )}

                  {booking.status === 'PENDING' && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                      <span>⏳ พนักงานกำลังตรวจสอบยอดสลิปเงินโอน จะอัปเดตสถานะภายใน 15-30 นาที</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าแรก</span>
        </Link>
      </div>
    </div>
  );
}

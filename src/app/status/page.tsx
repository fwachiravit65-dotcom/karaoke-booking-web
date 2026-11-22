'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatBaht, getStatusBadge } from '@/lib/utils';
import { Booking } from '@/types';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    bookingCode: 'MD-20261122-8F29',
    roomId: 'room-2',
    customerName: 'มิ้นท์ (แก๊ง ม.6/2)',
    customerPhone: '0812345678',
    customerEmail: 'mint@student.ac.th',
    bookingDate: '2026-11-22',
    startTime: '16:00',
    endTime: '18:00',
    totalHours: 2,
    roomCharge: 400,
    packageCharge: 0,
    totalAmount: 400,
    depositAmount: 400,
    status: 'CONFIRMED',
    slipImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=400',
    createdAt: '2026-11-22T10:00:00Z',
  },
  {
    id: 'b-2',
    bookingCode: 'MD-20261123-9921',
    roomId: 'room-1',
    customerName: 'มิ้นท์ (แก๊ง ม.6/2)',
    customerPhone: '0812345678',
    bookingDate: '2026-11-23',
    startTime: '17:00',
    endTime: '19:00',
    totalHours: 2,
    roomCharge: 280,
    packageCharge: 0,
    totalAmount: 280,
    depositAmount: 280,
    status: 'PENDING',
    createdAt: '2026-11-22T12:30:00Z',
  },
];

export default function StatusPage() {
  const [searchTerm, setSearchTerm] = useState('0812345678');

  const filteredBookings = MOCK_BOOKINGS.filter(
    (b) =>
      b.customerPhone.includes(searchTerm.trim()) ||
      b.bookingCode.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
      {/* Header */}
      <div className="hairline-b pb-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-tech text-xs text-[#D9381E]">
            02 / TICKET &amp; QUEUE LOOKUP
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-[#121212] mt-2 leading-tight">
            เช็คคิวจองของคุณ
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#68645E] max-w-sm">
          ค้นหาคิวห้องของคุณด้วยเบอร์โทรศัพท์ หรือรหัสการจอง (MD-...)
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-12">
        <label className="block text-xs font-bold text-[#68645E] mb-2">
          กรอกเบอร์โทรศัพท์ หรือ รหัสการจอง (เช่น 0812345678)
        </label>
        <div className="flex flex-col sm:flex-row hairline-all bg-[#F7F5F0]">
          <input
            type="text"
            placeholder="0812345678 หรือ MD-..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-5 py-4 bg-transparent text-sm font-semibold text-[#121212] focus:outline-none"
          />
          <button
            type="button"
            className="px-8 py-4 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-bold uppercase tracking-wider editorial-transition"
          >
            ค้นหาคิวจอง →
          </button>
        </div>
      </div>

      {/* Results Ledger */}
      <div className="space-y-6">
        <div className="text-xs font-bold text-[#68645E]">
          พบรายการจองทั้งหมด {filteredBookings.length} รายการ
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 hairline-all bg-[#EFECE6]/40 text-center space-y-2">
            <p className="text-xs font-bold text-[#D9381E]">ไม่พบข้อมูลคิวจอง</p>
            <p className="text-sm text-[#68645E]">
              ไม่พบข้อมูลการจองจากเบอร์โทรหรือรหัสที่ระบุ กรุณาตรวจสอบตัวเลขอีกครั้ง
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const badge = getStatusBadge(booking.status);
            return (
              <div
                key={booking.id}
                className="hairline-all bg-[#F7F5F0] hover:bg-[#EFECE6]/40 editorial-transition p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 hairline-b">
                  <div>
                    <span className="text-[11px] text-[#68645E] block">
                      รหัสการจอง (BOOKING CODE)
                    </span>
                    <span className="text-lg font-bold text-[#121212]">
                      {booking.bookingCode}
                    </span>
                  </div>
                  <span
                    className={`inline-block text-xs font-bold px-3.5 py-1.5 border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 py-6 text-xs sm:text-sm hairline-b">
                  <div>
                    <span className="text-xs text-[#68645E] block mb-1">วันที่และเวลา</span>
                    <span className="text-[#121212] font-bold">
                      {booking.bookingDate} ({booking.startTime}–{booking.endTime} น.)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#68645E] block mb-1">ห้องที่จอง</span>
                    <span className="text-[#121212] font-bold">
                      {booking.roomId === 'room-2'
                        ? 'ST-102 · Get-together(M)'
                        : 'ST-101 · Catch-Up(S)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#68645E] block mb-1">ชื่อผู้จอง</span>
                    <span className="text-[#121212] font-bold">
                      {booking.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#68645E] block mb-1">ยอดชำระ</span>
                    <span className="text-[#D9381E] font-bold">
                      {formatBaht(booking.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#68645E]">
                  {booking.status === 'CONFIRMED' ? (
                    <span className="text-[#121212] font-medium">
                      ✓ ห้องถูกล็อกคิวเรียบร้อยแล้ว แสดงรหัส {booking.bookingCode} ที่เคาน์เตอร์หน้าร้านได้เลย
                    </span>
                  ) : (
                    <span>
                      — พนักงานกำลังตรวจสอบรายการของคุณ
                    </span>
                  )}
                  <span className="font-bold">สาขา : ร้อยเอ็ด 1 (หน้าร้อยเอ็ดวิทย์)</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 pt-8 hairline-t flex justify-between items-center text-xs font-bold">
        <Link href="/" className="link-editorial text-[#121212]">
          ← กลับหน้าแรก
        </Link>
        <Link href="/booking" className="link-editorial text-[#D9381E]">
          จองคิวห้องเพิ่ม →
        </Link>
      </div>
    </div>
  );
}

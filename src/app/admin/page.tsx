'use client';

import { useState, useEffect } from 'react';
import { formatBaht, getStatusBadge } from '@/lib/utils';
import { Booking, BookingStatus } from '@/types';
import {
  StaffAccount,
  verifyStaffPin,
  getCurrentMember,
  getAllBookings,
  updateBookingStatusInStore,
} from '@/lib/member-store';

export default function AdminPage() {
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(null);
  const [staffPhone, setStaffPhone] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | BookingStatus>('ALL');

  useEffect(() => {
    setBookings(getAllBookings());
    const currentMember = getCurrentMember();
    if (currentMember && currentMember.role === 'STAFF') {
      setStaffPhone(currentMember.phone);
      // Automatically unlock if logged in as a promoted STAFF account
      setActiveStaff({
        staffId: 'STF-ACTIVE',
        phone: currentMember.phone,
        name: currentMember.name,
        pinCode: currentMember.pin,
        branch: 'สาขาร้อยเอ็ด 1',
        role: currentMember.staffTitle || 'พนักงานร้าน (Promoted Staff)',
        isPromotedMember: true,
      });
    }

    const syncBookings = () => setBookings(getAllBookings());
    window.addEventListener('mood-bookings-change', syncBookings);
    return () => window.removeEventListener('mood-bookings-change', syncBookings);
  }, []);

  const handleStaffDigit = (digit: string) => {
    setPinError('');
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 6) {
        setTimeout(() => {
          const staff = verifyStaffPin(next, staffPhone);
          if (staff) {
            setActiveStaff(staff);
            setPinInput('');
          } else {
            setPinError(
              'รหัส PIN ไม่ถูกต้อง หรือเบอร์โทรนี้ยังไม่ได้รับการโปรโมทเป็นพนักงานในหน้า DEV'
            );
            setPinInput('');
          }
        }, 120);
      }
    }
  };

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    const updated = updateBookingStatusInStore(id, newStatus);
    setBookings(updated);
  };

  if (!activeStaff) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 sm:py-24">
        <div className="hairline-all bg-[#F7F5F0] p-8 sm:p-10 text-center">
          <span className="font-tech text-[11px] uppercase tracking-widest text-[#D9381E] block">
            STAFF ONLY — พนักงานหน้าร้าน
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#121212] mt-1">
            Staff Counter Lock
          </h1>
          <p className="text-xs text-[#68645E] mt-2 mb-6 leading-relaxed">
            ใช้เบอร์โทรและรหัส PIN 6 หลักของบัญชีที่ได้รับการโปรโมทเป็นพนักงานจากหน้า DEV เพื่อเข้าจัดการคิวห้อง
          </p>

          <div className="mb-4 text-left">
            <label className="block text-[11px] font-bold text-[#68645E] mb-1">
              เบอร์โทรพนักงาน (หรือเว้นว่างหากใช้รหัสกลาง)
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="09XXXXXXXX"
              value={staffPhone}
              onChange={(e) => setStaffPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] hairline-all text-sm font-bold text-center text-[#121212] focus:outline-none"
            />
          </div>

          {/* 6 PIN Dots */}
          <div className="flex items-center justify-center gap-4 py-3 mb-3">
            {Array.from({ length: 6 }).map((_, idx) => {
              const filled = idx < pinInput.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    filled
                      ? 'bg-[#121212] border-[#121212] scale-110'
                      : 'bg-transparent border-[#121212]/30'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="mb-4 p-2.5 hairline-all bg-[#D9381E]/10 text-[#D9381E] text-xs font-medium leading-relaxed">
              {pinError}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 hairline-t hairline-l select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => handleStaffDigit(d)}
                className="py-3.5 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] active:bg-[#121212] active:text-[#F7F5F0] text-base font-bold"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPinInput('')}
              className="py-3.5 hairline-r hairline-b bg-[#EFECE6]/50 text-xs font-bold text-[#68645E]"
            >
              CLR
            </button>
            <button
              type="button"
              onClick={() => handleStaffDigit('0')}
              className="py-3.5 hairline-r hairline-b bg-[#F7F5F0] hover:bg-[#EFECE6] text-base font-bold"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPinInput((p) => p.slice(0, -1))}
              className="py-3.5 hairline-r hairline-b bg-[#EFECE6]/50 text-xs font-bold text-[#121212]"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const rejectedCount = bookings.filter((b) => b.status === 'REJECTED').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 hairline-b mb-10">
        <div>
          <p className="font-tech text-xs text-[#D9381E]">
            STAFF COUNTER — พนักงาน: {activeStaff.name} ({activeStaff.phone})
          </p>
          <h1 className="font-display text-3xl sm:text-5xl text-[#121212] mt-2">
            จัดการคิวห้องหน้าร้าน
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-end">
          <div className="text-xs font-bold px-3.5 py-2 hairline-all bg-[#EFECE6] text-[#121212] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D9381E]" />
            <span>สาขา : ร้อยเอ็ด 1</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveStaff(null)}
            className="text-xs font-bold px-3.5 py-2 hairline-all hover:bg-[#121212] hover:text-[#F7F5F0] editorial-transition"
          >
            ล็อกหน้าจอพนักงาน
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 hairline-all mb-10 bg-[#EFECE6]/50">
        <div className="p-6 hairline-b sm:border-b-0 sm:hairline-r">
          <span className="text-xs font-bold text-[#68645E] block mb-2">
            01 / ยอดรอตรวจสลิป
          </span>
          <div className="font-display text-4xl text-[#D9381E]">
            {pendingCount} <span className="text-sm font-normal text-[#68645E]">รายการ</span>
          </div>
        </div>

        <div className="p-6 hairline-b sm:border-b-0 sm:hairline-r">
          <span className="text-xs font-bold text-[#68645E] block mb-2">
            02 / ห้องที่ยืนยันแล้ว
          </span>
          <div className="font-display text-4xl text-[#121212]">
            {confirmedCount} <span className="text-sm font-normal text-[#68645E]">ห้อง</span>
          </div>
        </div>

        <div className="p-6 hairline-b sm:border-b-0 sm:hairline-r">
          <span className="text-xs font-bold text-[#68645E] block mb-2">
            03 / ยอดปฏิเสธการจอง
          </span>
          <div className="font-display text-4xl text-[#68645E]">
            {rejectedCount} <span className="text-sm font-normal text-[#68645E]">รายการ</span>
          </div>
        </div>

        <div className="p-6">
          <span className="text-xs font-bold text-[#68645E] block mb-2">
            04 / ยอดขายรวม
          </span>
          <div className="font-display text-4xl text-[#121212]">
            {formatBaht(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 text-xs font-bold">
        {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2.5 whitespace-nowrap editorial-transition ${
              filter === tab
                ? 'bg-[#121212] text-[#F7F5F0]'
                : 'hairline-all bg-[#F7F5F0] text-[#68645E] hover:text-[#121212]'
            }`}
          >
            {tab === 'ALL' && `ทั้งหมด (${bookings.length})`}
            {tab === 'PENDING' && `รอตรวจสลิป (${pendingCount})`}
            {tab === 'CONFIRMED' && `ยืนยันแล้ว (${confirmedCount})`}
            {tab === 'COMPLETED' && 'เข้าใช้บริการแล้ว'}
            {tab === 'REJECTED' && `ปฏิเสธ (${rejectedCount})`}
          </button>
        ))}
      </div>

      {/* Bookings Ledger Rows */}
      <div className="hairline-t">
        {filtered.map((item) => {
          const badge = getStatusBadge(item.status);

          return (
            <div
              key={item.id}
              className="py-6 px-4 sm:px-6 hairline-b hover:bg-[#EFECE6]/50 editorial-transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-[#121212]">
                    {item.bookingCode}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-[#EFECE6] hairline-all">
                    ห้อง {item.roomId}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="text-base font-bold text-[#121212]">
                  {item.customerName}{' '}
                  <span className="text-xs font-normal text-[#68645E] ml-2">
                    เบอร์โทร: {item.customerPhone}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-[#68645E]">
                  <span>วันที่: {item.bookingDate}</span>
                  <span>
                    เวลา: {item.startTime}–{item.endTime} น. ({item.totalHours} ชม.)
                  </span>
                  <span className="text-[#121212] font-bold">
                    ยอดชำระ: <strong className="text-[#D9381E]">{formatBaht(item.totalAmount)}</strong>
                  </span>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                {item.slipImageUrl && (
                  <a
                    href={item.slipImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 hairline-all bg-[#F7F5F0] hover:bg-[#EFECE6] text-[#121212] editorial-transition"
                  >
                    ดูสลิป ↗
                  </a>
                )}

                {item.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus(item.id, 'CONFIRMED')}
                      className="px-5 py-2.5 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] editorial-transition"
                    >
                      ✓ อนุมัติห้อง
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, 'REJECTED')}
                      className="px-4 py-2.5 hairline-all text-[#D9381E] hover:bg-[#D9381E] hover:text-[#F7F5F0] editorial-transition"
                    >
                      × ปฏิเสธ
                    </button>
                  </>
                )}

                {item.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatus(item.id, 'COMPLETED')}
                    className="px-5 py-2.5 hairline-all bg-[#121212] text-[#F7F5F0] hover:bg-[#68645E] editorial-transition"
                  >
                    เช็คเอาท์ (เสร็จสิ้น)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

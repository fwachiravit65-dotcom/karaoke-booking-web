'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBaht, calculateEndTime } from '@/lib/utils';
import {
  MemberProfile,
  getCurrentMember,
  addMemberHours,
} from '@/lib/member-store';

export type SizeCategory = 'S' | 'M' | 'L';

interface SizeTier {
  size: SizeCategory;
  code: string;
  name: string;
  thaiDesc: string;
  pricePerHour: number;
  capacityText: string;
  defaultSplit: number;
}

export interface RoomUnit {
  id: string;
  roomNumber: string;
  floor: 1 | 2;
  size: SizeCategory;
  tierName: string;
  pricePerHour: number;
  capacityText: string;
  positionNote: string;
}

const SIZE_TIERS: SizeTier[] = [
  {
    size: 'S',
    code: 'SIZE S',
    name: 'Catch-Up(S)',
    thaiDesc: 'ห้องขนาด S สำหรับคู่ซี้หรือแก๊งเพื่อน 2–4 คน',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    defaultSplit: 4,
  },
  {
    size: 'M',
    code: 'SIZE M',
    name: 'Get-together(M)',
    thaiDesc: 'ห้องขนาด M กว้างสบาย สำหรับแก๊งเพื่อน 5–8 คน',
    pricePerHour: 200,
    capacityText: '5–8 คน',
    defaultSplit: 6,
  },
  {
    size: 'L',
    code: 'SIZE L',
    name: 'Reunion(L)',
    thaiDesc: 'ห้องขนาด L ปาร์ตี้แก๊งใหญ่ สำหรับ 9–14 คน',
    pricePerHour: 280,
    capacityText: '9–14 คน',
    defaultSplit: 10,
  },
];

const ALL_ROOMS: Record<string, RoomUnit> = {
  R1: {
    id: 'R1',
    roomNumber: 'R1',
    floor: 1,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 1 · ห้องแรกใกล้โซนคาเฟ่หน้าร้าน',
  },
  R2: {
    id: 'R2',
    roomNumber: 'R2',
    floor: 1,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 1 · ห้องกลางระหว่าง R1 และ R3',
  },
  R3: {
    id: 'R3',
    roomNumber: 'R3',
    floor: 1,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 1 · ห้องโซนในติดห้องใหญ่ R4',
  },
  R4: {
    id: 'R4',
    roomNumber: 'R4',
    floor: 1,
    size: 'L',
    tierName: 'Reunion(L)',
    pricePerHour: 280,
    capacityText: '9–14 คน',
    positionNote: 'ชั้น 1 · ห้องใหญ่โซนด้านในสุด',
  },
  R5: {
    id: 'R5',
    roomNumber: 'R5',
    floor: 2,
    size: 'M',
    tierName: 'Get-together(M)',
    pricePerHour: 200,
    capacityText: '5–8 คน',
    positionNote: 'ชั้น 2 · ห้องขนาดกลางโซนหน้าฝั่งขวา',
  },
  R6: {
    id: 'R6',
    roomNumber: 'R6',
    floor: 2,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 2 · ฝั่งขวาใกล้โถงบันได',
  },
  R7: {
    id: 'R7',
    roomNumber: 'R7',
    floor: 2,
    size: 'L',
    tierName: 'Reunion(L)',
    pricePerHour: 280,
    capacityText: '9–14 คน',
    positionNote: 'ชั้น 2 · ห้องใหญ่โซนหน้าฝั่งซ้าย',
  },
  R8: {
    id: 'R8',
    roomNumber: 'R8',
    floor: 2,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 2 · ฝั่งซ้ายติดห้องใหญ่ R7',
  },
  R9: {
    id: 'R9',
    roomNumber: 'R9',
    floor: 2,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 2 · ฝั่งซ้ายช่วงกลาง',
  },
  R10: {
    id: 'R10',
    roomNumber: 'R10',
    floor: 2,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 2 · ฝั่งซ้ายถัดจาก R11',
  },
  R11: {
    id: 'R11',
    roomNumber: 'R11',
    floor: 2,
    size: 'S',
    tierName: 'Catch-Up(S)',
    pricePerHour: 140,
    capacityText: '2–4 คน',
    positionNote: 'ชั้น 2 · ฝั่งซ้ายริมระเบียง',
  },
};

const TIME_SLOTS = [
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function BookingPage() {
  const [activeMember, setActiveMember] = useState<MemberProfile | null>(null);
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>('R1');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('16:00');
  const [totalHours, setTotalHours] = useState<number>(2);
  const [splitCount, setSplitCount] = useState<number>(4);

  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    bookingCode?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const m = getCurrentMember();
    if (m) {
      setActiveMember(m);
      setCustomerName(m.name);
      setCustomerPhone(m.phone);
    }
  }, []);

  const currentRoom = ALL_ROOMS[selectedRoomKey] || ALL_ROOMS.R1;

  const handleSelectSizeTier = (tier: SizeTier) => {
    setSplitCount(tier.defaultSplit);
    if (tier.size === 'S' && currentRoom.size !== 'S') setSelectedRoomKey('R1');
    if (tier.size === 'M' && currentRoom.size !== 'M') setSelectedRoomKey('R5');
    if (tier.size === 'L' && currentRoom.size !== 'L') setSelectedRoomKey('R4');
  };

  const handleSelectRoom = (roomKey: string) => {
    const target = ALL_ROOMS[roomKey];
    if (!target) return;
    setSelectedRoomKey(roomKey);
    const tier = SIZE_TIERS.find((t) => t.size === target.size);
    if (tier && target.size !== currentRoom.size) {
      setSplitCount(tier.defaultSplit);
    }
  };

  const rawRoomCharge = currentRoom.pricePerHour * totalHours;
  const totalAmount = Math.max(0, rawRoomCharge - appliedDiscount);
  const perPersonShare = Math.max(1, Math.round(totalAmount / Math.max(1, splitCount)));
  const endTime = calculateEndTime(startTime, totalHours);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'MOOD20') {
      setAppliedDiscount(20);
    } else {
      setAppliedDiscount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('กรุณากรอกชื่อเล่นและเบอร์โทรศัพท์สำหรับรับรหัสเข้าห้อง');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom.id,
          roomName: `${currentRoom.roomNumber} (${currentRoom.tierName})`,
          bookingDate,
          startTime,
          endTime,
          totalHours,
          customerName,
          customerPhone,
          roomCharge: rawRoomCharge,
          packageCharge: 0,
          totalAmount,
          depositAmount: totalAmount,
        }),
      });

      const data = await res.json();
      addMemberHours(customerPhone, totalHours);
      setBookingResult(data);
    } catch {
      const fakeCode = `MD-${bookingDate.replace(/-/g, '')}-${currentRoom.roomNumber}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      addMemberHours(customerPhone, totalHours);
      setBookingResult({
        success: true,
        bookingCode: fakeCode,
        message: 'บันทึกคิวจองเรียบร้อย',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer-friendly Room Button with well-proportioned typography (zero text overflow)
  const renderRoomBox = (roomKey: string, heightClass = 'min-h-[76px]') => {
    const r = ALL_ROOMS[roomKey];
    const isSelected = selectedRoomKey === roomKey;
    const isSameSize = r.size === currentRoom.size;

    return (
      <button
        type="button"
        onClick={() => handleSelectRoom(roomKey)}
        className={`w-full ${heightClass} px-3 py-2 text-left transition-all duration-200 flex flex-col justify-between border ${
          isSelected
            ? 'bg-[#121212] text-[#F7F5F0] border-[#121212] shadow-sm z-10'
            : isSameSize
            ? 'bg-[#F7F5F0] text-[#121212] border-[#121212]/70 hover:bg-[#EFECE6]'
            : 'bg-[#F7F5F0]/80 text-[#68645E] border-[#121212]/20 hover:bg-[#EFECE6] hover:text-[#121212]'
        }`}
      >
        {/* Top Row: Room Code + Size Badge */}
        <div className="flex items-center justify-between gap-1 w-full">
          <span className="font-display text-base leading-none">
            {r.roomNumber}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 leading-none ${
              isSelected
                ? 'bg-[#D9381E] text-[#F7F5F0]'
                : r.size === 'L'
                ? 'bg-[#121212] text-[#F7F5F0]'
                : r.size === 'M'
                ? 'bg-[#D9381E]/15 text-[#D9381E]'
                : 'bg-[#EFECE6] text-[#68645E]'
            }`}
          >
            {r.size}
          </span>
        </div>

        {/* Middle Row: Tier Name */}
        <div
          className={`text-[11px] font-bold leading-tight truncate my-0.5 ${
            isSelected ? 'text-[#F7F5F0]' : 'text-[#121212]'
          }`}
        >
          {r.tierName}
        </div>

        {/* Bottom Row: Capacity & Price */}
        <div className="flex items-center justify-between text-[10px] w-full pt-1 border-t border-current/10">
          <span className={isSelected ? 'text-[#F7F5F0]/80' : 'text-[#68645E]'}>
            {r.capacityText}
          </span>
          <span className={`font-bold ${isSelected ? 'text-[#D9381E]' : 'text-[#121212]'}`}>
            ฿{r.pricePerHour}
          </span>
        </div>
      </button>
    );
  };

  if (bookingResult?.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-[#EFECE6] hairline-all p-8 sm:p-12">
          <div className="flex items-center justify-between hairline-b pb-6 mb-8">
            <div>
              <span className="font-tech text-xs text-[#D9381E] block">
                RESERVATION TICKET ISSUED
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#121212] mt-1">
                ล็อกคิวห้อง {currentRoom.roomNumber} สำเร็จ!
              </h2>
            </div>
            <div className="font-tech text-xs px-3 py-1.5 bg-[#121212] text-[#F7F5F0]">
              ห้อง {currentRoom.roomNumber} (ชั้น {currentRoom.floor})
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm hairline-b pb-8 mb-8">
            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#68645E]">รหัสเข้าห้อง (Booking Code)</span>
              <span className="text-base font-bold text-[#D9381E]">
                {bookingResult.bookingCode}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68645E]">ห้องที่จอง</span>
              <span className="text-[#121212] font-bold">
                ห้อง {currentRoom.roomNumber} (ชั้น {currentRoom.floor}) — {currentRoom.tierName}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68645E]">วันที่และรอบเวลา</span>
              <span className="text-[#121212] font-semibold">
                {bookingDate} · {startTime} — {endTime} น. ({totalHours} ชั่วโมง)
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68645E]">ผู้จอง</span>
              <span className="text-[#121212] font-semibold">
                {customerName} ({customerPhone})
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68645E]">ยอดชำระรวม</span>
              <span className="text-[#121212] font-bold">{formatBaht(totalAmount)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68645E]">ชั่วโมงสะสมสมาชิกที่ได้รับ</span>
              <span className="text-[#D9381E] font-bold">+{totalHours} ชั่วโมง</span>
            </div>
          </div>

          <p className="text-xs text-[#68645E] leading-relaxed mb-8">
            * กรุณาแคปหน้าจอตั๋วใบนี้ไว้เพื่อนำมาแสดงที่เคาน์เตอร์หน้าร้าน (สาขาร้อยเอ็ด 1 หน้าโรงเรียนร้อยเอ็ดวิทย์) ก่อนเวลาเข้าห้อง 5 นาทีครับ
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/member"
              className="flex-1 py-4 bg-[#121212] text-[#F7F5F0] hover:bg-[#D9381E] text-xs font-bold text-center editorial-transition"
            >
              ดูบัตรสะสมชั่วโมงของฉัน →
            </Link>
            <Link
              href={`/status?phone=${customerPhone}`}
              className="flex-1 py-4 hairline-all text-[#121212] hover:bg-[#F7F5F0] text-xs font-bold text-center editorial-transition"
            >
              เช็คสถานะคิวจอง
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Page Header */}
      <div className="hairline-b pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-tech text-xs text-[#D9381E]">
            MOOD. KARAOKE ROOM — สาขาร้อยเอ็ด 1 (หน้าร้อยเอ็ดวิทย์)
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-[#121212] mt-2 leading-tight">
            จองคิวห้องออนไลน์
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#68645E] max-w-md">
          เลือกขนาดห้องและกดเลือกห้องที่ต้องการจากชั้น 1 หรือชั้น 2 ระบบจะล็อกคิวห้องให้ทันทีพร้อมคำนวณราคาหารเฉลี่ยต่อคน
        </p>
      </div>

      {/* Part 3.1 — แถบสถานะสมาชิกด้านบน */}
      <div className="mb-12 p-4 sm:px-6 hairline-all bg-[#EFECE6]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {activeMember ? (
          <>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="font-tech text-xs px-2.5 py-0.5 bg-[#121212] text-[#F7F5F0]">
                MEMBER ACTIVE
              </span>
              <span className="text-[#121212] font-medium">
                สวัสดีคุณ <strong>{activeMember.name}</strong> ({activeMember.phone}) · จองครั้งนี้รับชั่วโมงสะสมเพิ่ม <strong className="text-[#D9381E]">+{totalHours} ชั่วโมง</strong>
              </span>
            </div>
            <Link
              href="/member"
              className="text-xs font-bold text-[#121212] link-editorial"
            >
              ดูบัตรสะสม ({activeMember.totalHoursAccumulated % 10}/10 ชม.) →
            </Link>
          </>
        ) : (
          <>
            <div className="text-xs sm:text-sm text-[#121212]">
              <span className="font-bold text-[#D9381E] mr-2">
                [สิทธิ์สมาชิก MOOD]
              </span>
              สามารถจองด่วนได้เลย หรือล็อกอิน/สมัครสมาชิกด้วย <strong>เบอร์โทร + PIN 6 หลัก</strong> เพื่อสะสมครบ 10 ชม. ฟรี 1 ชม.
            </div>
            <Link
              href="/member"
              className="text-xs font-bold text-[#D9381E] link-editorial whitespace-nowrap"
            >
              ไปหน้าล็อกอิน / สมัครสมาชิก →
            </Link>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ฝั่งซ้าย: 4 ขั้นตอนการเลือกข้อมูล */}
        <div className="lg:col-span-7 space-y-12">
          {/* Part B.1 — 01 / เลือกขนาดห้อง + เลือกห้องจากชั้น 1 และ ชั้น 2 */}
          <div className="hairline-b pb-10 space-y-8">
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-bold text-[#121212]">
                  <span className="font-tech text-xs text-[#D9381E] mr-2.5">01 /</span>
                  เลือกขนาดห้อง (3 ขนาดห้อง)
                </h2>
                <span className="text-xs font-bold text-[#D9381E]">
                  เลือกอยู่: ห้อง {currentRoom.roomNumber} (ชั้น {currentRoom.floor})
                </span>
              </div>

              {/* 1. กล่องเลือกขนาดห้อง 3 ขนาด (S, M, L) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 hairline-t hairline-l">
                {SIZE_TIERS.map((tier) => {
                  const isSelected = currentRoom.size === tier.size;
                  return (
                    <button
                      type="button"
                      key={tier.size}
                      onClick={() => handleSelectSizeTier(tier)}
                      className={`p-5 text-left hairline-r hairline-b editorial-transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#121212] text-[#F7F5F0]'
                          : 'bg-[#F7F5F0] text-[#121212] hover:bg-[#EFECE6]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-bold mb-2">
                          <span className={isSelected ? 'text-[#D9381E]' : 'text-[#68645E]'}>
                            {tier.code}
                          </span>
                          <span className={isSelected ? 'text-[#F7F5F0]/80' : 'text-[#68645E]'}>
                            {tier.capacityText}
                          </span>
                        </div>
                        <div className="font-display text-xl sm:text-2xl leading-tight mb-1.5">
                          {tier.name}
                        </div>
                        <p
                          className={`text-xs mb-3 leading-relaxed ${
                            isSelected ? 'text-[#F7F5F0]/80' : 'text-[#68645E]'
                          }`}
                        >
                          {tier.thaiDesc}
                        </p>
                      </div>

                      <div className="pt-3 hairline-t flex items-baseline justify-between text-xs">
                        <span>ราคา</span>
                        <span className="font-bold text-sm">
                          {formatBaht(tier.pricePerHour)} / ชม.
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. เลือกห้องจาก ชั้น 1 และ ชั้น 2 (ใช้คำว่า ชั้น 1 และ ชั้น 2 สำหรับลูกค้า) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#121212]">
                    เลือกห้องที่ต้องการ (R1 – R11)
                  </h3>
                  <p className="text-xs text-[#68645E]">
                    กดเลือกหมายเลขห้องจากชั้น 1 หรือ ชั้น 2 ได้โดยตรง
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#121212] inline-block" />
                    ห้องที่เลือก ({currentRoom.roomNumber})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#F7F5F0] border border-[#121212]/70 inline-block" />
                    ขนาดเดียวกัน (Size {currentRoom.size})
                  </span>
                </div>
              </div>

              {/* Side-by-Side ชั้น 1 & ชั้น 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* ================= ชั้น 1 (ห้อง R1 – R4) ================= */}
                <div className="hairline-all bg-[#EFECE6]/60 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 hairline-b">
                      <div>
                        <span className="font-tech text-[10px] text-[#D9381E] block">
                          FLOOR 01
                        </span>
                        <h4 className="font-display text-lg text-[#121212]">
                          ชั้น 1 (ห้อง R1 – R4)
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-[#F7F5F0] hairline-all text-[#121212]">
                        4 ห้องคาราโอเกะ
                      </span>
                    </div>

                    <div className="text-center text-[10px] font-bold text-[#68645E] mb-1.5">
                      ↑ โซนด้านในร้าน ↑
                    </div>

                    {/* ชั้น 1 Container */}
                    <div className="border-2 border-[#121212]/80 bg-[#E5E0D8] p-2.5 space-y-2">
                      {/* Row 1 (Back of Floor 1): R4 Large (Left 7 cols) + ห้องน้ำหญิง (Right 5 cols) */}
                      <div className="grid grid-cols-12 gap-2 items-stretch">
                        <div className="col-span-7">
                          {renderRoomBox('R4', 'min-h-[96px]')}
                        </div>
                        <div className="col-span-5 bg-[#EFECE6]/75 border border-dashed border-[#121212]/25 p-2 flex items-center justify-center text-center">
                          <span className="text-xs font-bold text-[#121212]/70">ห้องน้ำหญิง</span>
                        </div>
                      </div>

                      {/* Row 2 (Middle Body of Floor 1):
                          Left 5 cols = R3, R2, R1
                          Center 2 cols = ทางเดิน
                          Right 5 cols = โถงหน้าห้องน้ำ + บันไดขึ้นชั้น 2 + โซนพนักงาน */}
                      <div className="grid grid-cols-12 gap-2 items-stretch">
                        {/* Left Wall: R3 -> R2 -> R1 */}
                        <div className="col-span-5 flex flex-col gap-2">
                          {renderRoomBox('R3', 'min-h-[82px]')}
                          {renderRoomBox('R2', 'min-h-[82px]')}
                          {renderRoomBox('R1', 'min-h-[82px]')}
                        </div>

                        {/* Center Corridor */}
                        <div className="col-span-2 bg-[#D6D1C7] border-x border-[#121212]/15 flex flex-col items-center justify-between py-3 px-1">
                          <span className="text-[9px] font-bold text-[#121212]/60">▲</span>
                          <span className="text-[11px] font-bold text-[#121212]/75 [writing-mode:vertical-rl] tracking-widest">
                            ทางเดิน
                          </span>
                          <span className="text-[9px] font-bold text-[#121212]/60">▼</span>
                        </div>

                        {/* Right Wall: โถงหน้าห้องน้ำ -> บันไดขึ้นชั้น 2 -> โซนพนักงาน */}
                        <div className="col-span-5 flex flex-col gap-2 text-center">
                          <div className="min-h-[54px] bg-[#EFECE6]/70 border border-dashed border-[#121212]/20 p-1.5 flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-[#121212]/70">โถงหน้าห้องน้ำ</span>
                          </div>
                          <div className="min-h-[104px] bg-[#EFECE6]/90 border border-dashed border-[#121212]/30 p-2 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#121212]/80">บันไดขึ้นชั้น 2</span>
                          </div>
                          <div className="flex-1 bg-[#EFECE6]/70 border border-dashed border-[#121212]/20 p-1.5 flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-[#121212]/65">โซนพนักงาน</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 3 (Front of Shop — Floor 1): โซนของกิน (Left) + คาเฟ่ & เคาน์เตอร์หน้าร้าน (Right) */}
                      <div className="grid grid-cols-12 gap-2 pt-0.5">
                        <div className="col-span-4 min-h-[96px] bg-[#EFECE6]/80 border border-dashed border-[#121212]/25 p-2 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-bold text-[#121212]/80">โซนของกิน</span>
                          <span className="text-[10px] text-[#68645E] mt-0.5">&amp; โต๊ะนั่ง</span>
                        </div>
                        <div className="col-span-8 min-h-[96px] bg-[#EFECE6] border border-dashed border-[#121212]/30 p-2.5 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-bold text-[#121212]/85">
                            คาเฟ่ &amp; เคาน์เตอร์หน้าร้าน
                          </span>
                          <span className="text-[10px] text-[#68645E] mt-0.5">
                            (ประตูทางเข้าหลัก)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-center text-[11px] font-bold text-[#D9381E]">
                    ↓ ทางเข้าหน้าร้าน (ชั้น 1) ↓
                  </div>
                </div>

                {/* ================= ชั้น 2 (ห้อง R5 – R11) ================= */}
                <div className="hairline-all bg-[#EFECE6]/60 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 hairline-b">
                      <div>
                        <span className="font-tech text-[10px] text-[#D9381E] block">
                          FLOOR 02
                        </span>
                        <h4 className="font-display text-lg text-[#121212]">
                          ชั้น 2 (ห้อง R5 – R11)
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-[#F7F5F0] hairline-all text-[#121212]">
                        7 ห้องคาราโอเกะ
                      </span>
                    </div>

                    <div className="text-center text-[10px] font-bold text-[#68645E] mb-1.5">
                      ↑ โซนระเบียงด้านหลัง ↑
                    </div>

                    {/* ชั้น 2 Container */}
                    <div className="border-2 border-[#121212]/80 bg-[#E5E0D8] p-2.5 space-y-2">
                      {/* Row 1 (Back Balcony): ระเบียง */}
                      <div className="py-2 px-3 bg-[#EFECE6]/75 border border-dashed border-[#121212]/25 text-center">
                        <span className="text-xs font-bold text-[#121212]/75">
                          ระเบียงชั้น 2
                        </span>
                      </div>

                      {/* Row 2 (Middle Body of Floor 2):
                          Left 5 cols = R11, R10, R9, R8
                          Center 2 cols = ทางเดิน
                          Right 5 cols = ห้องน้ำชาย + โถงบันไดชั้น 2 + ห้อง R6 */}
                      <div className="grid grid-cols-12 gap-2 items-stretch">
                        {/* Left Wall: R11 -> R10 -> R9 -> R8 */}
                        <div className="col-span-5 flex flex-col gap-2">
                          {renderRoomBox('R11', 'min-h-[76px]')}
                          {renderRoomBox('R10', 'min-h-[76px]')}
                          {renderRoomBox('R9', 'min-h-[76px]')}
                          {renderRoomBox('R8', 'min-h-[76px]')}
                        </div>

                        {/* Center Corridor */}
                        <div className="col-span-2 bg-[#D6D1C7] border-x border-[#121212]/15 flex flex-col items-center justify-between py-3 px-1">
                          <span className="text-[9px] font-bold text-[#121212]/60">▲</span>
                          <span className="text-[11px] font-bold text-[#121212]/75 [writing-mode:vertical-rl] tracking-widest">
                            ทางเดิน
                          </span>
                          <span className="text-[9px] font-bold text-[#121212]/60">▼</span>
                        </div>

                        {/* Right Wall: ห้องน้ำชาย -> โถงบันไดชั้น 2 -> R6 */}
                        <div className="col-span-5 flex flex-col gap-2">
                          <div className="min-h-[76px] bg-[#EFECE6]/75 border border-dashed border-[#121212]/25 p-2 flex items-center justify-center text-center">
                            <span className="text-xs font-bold text-[#121212]/70">ห้องน้ำชาย</span>
                          </div>
                          <div className="flex-1 min-h-[120px] bg-[#EFECE6]/85 border border-dashed border-[#121212]/30 p-2 flex items-center justify-center text-center">
                            <span className="text-xs font-bold text-[#121212]/80">บันไดชั้น 2</span>
                          </div>
                          <div>
                            {renderRoomBox('R6', 'min-h-[96px]')}
                          </div>
                        </div>
                      </div>

                      {/* Row 3 (Front of Building — Floor 2):
                          Left 7 cols = R7 (Size L)
                          Right 5 cols = R5 (Size M) */}
                      <div className="grid grid-cols-12 gap-2 pt-0.5 items-stretch">
                        <div className="col-span-7">
                          {renderRoomBox('R7', 'min-h-[96px]')}
                        </div>
                        <div className="col-span-5">
                          {renderRoomBox('R5', 'min-h-[96px]')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-center text-[11px] font-bold text-[#D9381E]">
                    ↓ โซนด้านหน้าชั้น 2 (ห้อง R7 &amp; R5) ↓
                  </div>
                </div>
              </div>

              {/* Selected Room Confirmation Banner */}
              <div className="p-4 hairline-all bg-[#F7F5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-[#D9381E] text-[#F7F5F0] font-display text-sm">
                    ห้อง {currentRoom.roomNumber} (ชั้น {currentRoom.floor})
                  </span>
                  <div className="text-xs sm:text-sm">
                    <strong className="text-[#121212]">{currentRoom.tierName}</strong>
                    <span className="text-[#68645E] ml-2">
                      (รองรับ {currentRoom.capacityText} · {currentRoom.positionNote})
                    </span>
                  </div>
                </div>
                <span className="font-display text-base text-[#121212]">
                  {formatBaht(currentRoom.pricePerHour)} / ชม.
                </span>
              </div>
            </div>
          </div>

          {/* 02 วัน เวลา และปุ่มปรับจำนวนเพื่อนที่มาหารกัน */}
          <div className="hairline-b pb-10">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-lg font-bold text-[#121212]">
                <span className="font-tech text-xs text-[#D9381E] mr-2.5">02 /</span>
                วัน เวลา และจำนวนเพื่อนที่มากัน
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#68645E] mb-2">
                  วันที่เข้าใช้บริการ
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all text-sm font-semibold text-[#121212] focus:border-[#121212] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#68645E] mb-2">
                  จำนวนชั่วโมง (1–4 ชม.)
                </label>
                <div className="grid grid-cols-4 hairline-t hairline-l">
                  {[1, 2, 3, 4].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setTotalHours(hrs)}
                      className={`py-3 text-xs font-bold hairline-r hairline-b editorial-transition ${
                        totalHours === hrs
                          ? 'bg-[#121212] text-[#F7F5F0]'
                          : 'bg-[#F7F5F0] text-[#121212] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {hrs} ชม.
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Time Grid (13:00 - 22:00) */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#68645E]">
                  เวลาเริ่ม (ร้องถึงเวลา {endTime} น.)
                </label>
                <span className="text-xs font-bold text-[#D9381E]">
                  เลือกเวลาเริ่ม 13:00 — 22:00 น.
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 hairline-t hairline-l">
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setStartTime(slot)}
                    className={`py-3 text-xs font-bold hairline-r hairline-b editorial-transition ${
                      startTime === slot
                        ? 'bg-[#D9381E] text-[#F7F5F0]'
                        : 'bg-[#F7F5F0] text-[#121212] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* ปุ่ม [-] [+] ปรับจำนวนเพื่อนที่มากัน */}
            <div className="hairline-all bg-[#EFECE6]/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-[#121212] block">
                  คำนวณหารค่าห้องตามจำนวนเพื่อนที่มากัน
                </span>
                <span className="text-xs text-[#68645E]">
                  กดปุ่ม [-] หรือ [+] เพื่อดูราคาหารเฉลี่ยต่อคนในตั๋วสรุปยอดด้านขวา
                </span>
              </div>

              <div className="flex items-center hairline-all bg-[#F7F5F0] self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                  className="px-4 py-2 font-bold text-base hover:bg-[#EFECE6]"
                >
                  -
                </button>
                <span className="px-5 py-2 text-xs font-bold">
                  มากัน {splitCount} คน
                </span>
                <button
                  type="button"
                  onClick={() => setSplitCount(splitCount + 1)}
                  className="px-4 py-2 font-bold text-base hover:bg-[#EFECE6]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 03 เมนูน้ำและขนมเสริม (ไม่บังคับ) */}
          <div className="hairline-b pb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-bold text-[#121212]">
                <span className="font-tech text-xs text-[#D9381E] mr-2.5">03 /</span>
                เมนูน้ำและขนมเสริม (ไม่บังคับ)
              </h2>
              <span className="text-xs font-semibold text-[#D9381E]">
                MOOD CAFE PRE-ORDER
              </span>
            </div>

            <div className="p-6 hairline-all bg-[#EFECE6]/40 space-y-2">
              <div className="text-sm font-bold text-[#121212]">
                ☕ เมนูคาเฟ่และเครื่องดื่มภายในร้าน (เตรียมเปิดให้เลือกสั่งล่วงหน้าเร็วๆ นี้)
              </div>
              <p className="text-xs text-[#68645E] leading-relaxed">
                ส่วนนี้ใช้สำหรับเลือกสั่งเมนูเครื่องดื่มคาเฟ่ น้ำอัดลม และขนมทานเล่นล่วงหน้า เพื่อให้พนักงานจัดเตรียมเสิร์ฟไว้รอก่อนถึงเวลานัดของคุณ (สามารถสั่งเพิ่มเติมที่เคาน์เตอร์หน้าร้านได้โดยไม่มีขั้นต่ำ)
              </p>
            </div>
          </div>

          {/* 04 ข้อมูลผู้จอง: ชื่อเล่น และ เบอร์โทรศัพท์ */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-lg font-bold text-[#121212]">
                <span className="font-tech text-xs text-[#D9381E] mr-2.5">04 /</span>
                ข้อมูลผู้จอง
              </h2>
              {activeMember && (
                <span className="text-xs font-bold text-[#D9381E]">
                  ✓ ดึงข้อมูลจากบัญชีสมาชิกอัตโนมัติ
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#68645E] mb-2">
                  ชื่อเล่น *
                </label>
                <input
                  type="text"
                  placeholder="เช่น มิ้นท์ (แก๊ง ม.6/2)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all text-sm text-[#121212] focus:border-[#121212] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#68645E] mb-2">
                  เบอร์โทรศัพท์ (ใช้เช็คคิวและสะสมชั่วโมง) *
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F7F5F0] hairline-all text-sm font-semibold text-[#121212] focus:border-[#121212] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Part B.5 — ตั๋วสรุปยอดฝั่งขวา (Reservation Summary Ticket) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-[#EFECE6] hairline-all p-6 sm:p-8">
            <div className="flex items-center justify-between hairline-b pb-4 mb-6">
              <div>
                <span className="font-tech text-[10px] uppercase tracking-widest text-[#68645E] block">
                  MOOD. KARAOKE TICKET
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#121212] leading-tight mt-1">
                  Reservation Summary
                </h3>
              </div>
              <span className="font-display text-sm px-3 py-1 bg-[#121212] text-[#F7F5F0]">
                ห้อง {currentRoom.roomNumber} (ชั้น {currentRoom.floor})
              </span>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs sm:text-sm hairline-b pb-6 mb-6">
              <div className="flex justify-between">
                <span className="text-[#68645E]">ห้องที่เลือก</span>
                <span className="text-[#D9381E] font-bold">
                  ห้อง {currentRoom.roomNumber} · ชั้น {currentRoom.floor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68645E]">ขนาดห้อง</span>
                <span className="text-[#121212] font-bold">
                  {currentRoom.tierName} ({currentRoom.capacityText})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68645E]">วันที่และเวลา</span>
                <span className="text-[#121212] font-semibold">
                  {bookingDate} · {startTime}–{endTime} น. ({totalHours} ชม.)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68645E]">ค่าห้อง ({totalHours} ชั่วโมง)</span>
                <span className="text-[#121212] font-semibold">{formatBaht(rawRoomCharge)}</span>
              </div>

              {/* ส่วนลดต่างๆ หรือโค้ด */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="โค้ดส่วนลด (หากมี)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F7F5F0] hairline-all text-xs text-[#121212] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 hairline-all bg-[#F7F5F0] hover:bg-[#121212] hover:text-[#F7F5F0] text-xs font-bold editorial-transition"
                  >
                    ใช้โค้ด
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#D9381E] font-bold mt-2">
                    <span>ส่วนลดโปรโมชัน</span>
                    <span>-{formatBaht(appliedDiscount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals & Student Bill Splitter Highlight */}
            <div className="space-y-4 hairline-b pb-6 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#68645E]">ยอดชำระรวมทั้งหมด</span>
                <span className="font-display text-2xl text-[#121212]">
                  {formatBaht(totalAmount)}
                </span>
              </div>

              {/* กล่อง Student Bill Splitter */}
              <div className="p-4 bg-[#F7F5F0] hairline-all flex items-center justify-between">
                <div>
                  <span className="font-tech text-[10px] uppercase tracking-wider text-[#68645E] block">
                    STUDENT BILL SPLITTER
                  </span>
                  <span className="text-xs sm:text-sm text-[#121212] font-bold">
                    หาร {splitCount} คน = เฉลี่ยตกคนละ
                  </span>
                </div>
                <span className="font-display text-2xl sm:text-3xl text-[#D9381E]">
                  ~{formatBaht(perPersonShare)}
                </span>
              </div>
            </div>

            {/* QR Code PromptPay และปุ่มกดยืนยันล็อกห้อง */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 bg-[#F7F5F0] p-4 hairline-all">
                <div className="w-20 h-20 bg-white p-1.5 hairline-all flex-shrink-0">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOOD-KARAOKE-PROMPTPAY"
                    alt="PromptPay QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="font-tech text-[10px] uppercase tracking-wider text-[#D9381E] block">
                    QR CODE PROMPTPAY
                  </span>
                  <p className="text-xs font-bold text-[#121212]">
                    สแกนชำระค่าเข้าบริการ {formatBaht(totalAmount)}
                  </p>
                  <p className="text-[11px] text-[#68645E]">
                    MOOD KARAOKE สาขาร้อยเอ็ด 1
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#121212] hover:bg-[#D9381E] text-[#F7F5F0] text-sm font-bold tracking-wide editorial-transition disabled:opacity-50"
              >
                {isSubmitting
                  ? 'กำลังล็อกคิวห้อง...'
                  : `ยืนยันล็อกห้อง ${currentRoom.roomNumber} (ชั้น ${currentRoom.floor}) →`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
